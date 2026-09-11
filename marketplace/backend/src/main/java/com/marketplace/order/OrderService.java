package com.marketplace.order;

import com.marketplace.audit.AuditService;
import com.marketplace.entity.Cart;
import com.marketplace.entity.CartItem;
import com.marketplace.entity.OrderItem;
import com.marketplace.entity.OrderStatus;
import com.marketplace.entity.OrderStatusHistory;
import com.marketplace.entity.Payment;
import com.marketplace.entity.PaymentStatus;
import com.marketplace.entity.Product;
import com.marketplace.entity.ProductStatus;
import com.marketplace.entity.PurchaseOrder;
import com.marketplace.entity.Role;
import com.marketplace.entity.SellerOrder;
import com.marketplace.entity.Shop;
import com.marketplace.exception.ApiException;
import com.marketplace.repository.CartItemRepository;
import com.marketplace.repository.CartRepository;
import com.marketplace.repository.OrderStatusHistoryRepository;
import com.marketplace.repository.PaymentRepository;
import com.marketplace.repository.ProductRepository;
import com.marketplace.repository.PurchaseOrderRepository;
import com.marketplace.repository.SellerOrderRepository;
import com.marketplace.repository.UserRepository;
import com.marketplace.security.CurrentUser;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final PurchaseOrderRepository orderRepository;
    private final SellerOrderRepository sellerOrderRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final PaymentRepository paymentRepository;
    private final OrderStatusHistoryRepository historyRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    /**
     * Transforme le panier multivendeur en commande globale + sous-commandes par vendeur.
     * Le stock est décrémenté sous verrou pessimiste : pas de survente en cas d'achats simultanés.
     */
    @Transactional
    public OrderController.OrderResponse checkout(CurrentUser user, HttpServletRequest httpRequest) {
        Cart cart = cartRepository.findByBuyerId(user.id())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "CART_EMPTY", "Votre panier est vide"));
        if (cart.getItems().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "CART_EMPTY", "Votre panier est vide");
        }

        PurchaseOrder order = new PurchaseOrder();
        order.setBuyer(userRepository.getReferenceById(user.id()));
        order.setStatus(OrderStatus.PENDING);
        order.setCurrency("XOF");

        Map<Shop, List<CartItem>> byShop = cart.getItems().stream()
                .collect(Collectors.groupingBy(item -> item.getProduct().getShop()));

        long total = 0;
        for (Map.Entry<Shop, List<CartItem>> entry : byShop.entrySet()) {
            Shop shop = entry.getKey();
            SellerOrder sellerOrder = new SellerOrder();
            sellerOrder.setOrder(order);
            sellerOrder.setShop(shop);
            sellerOrder.setStatus(OrderStatus.PENDING);
            sellerOrder.setCurrency("XOF");

            long subtotal = 0;
            for (CartItem cartItem : entry.getValue()) {
                // Verrou pessimiste : un seul checkout peut décrémenter ce produit à la fois.
                Product product = productRepository.findByIdForUpdate(cartItem.getProduct().getId())
                        .orElseThrow(() -> ApiException.notFound("PRODUCT_NOT_FOUND", "Produit introuvable"));
                if (product.getStatus() != ProductStatus.ACTIVE || product.getStock() < cartItem.getQuantity()) {
                    throw new ApiException(HttpStatus.CONFLICT, "INSUFFICIENT_STOCK",
                            "Stock insuffisant pour « " + product.getName() + " »");
                }
                product.setStock(product.getStock() - cartItem.getQuantity());

                OrderItem line = new OrderItem();
                line.setSellerOrder(sellerOrder);
                line.setProduct(product);
                line.setProductName(product.getName());
                line.setQuantity(cartItem.getQuantity());
                line.setUnitPriceMinor(product.getPriceMinor());
                sellerOrder.getItems().add(line);
                subtotal += (long) cartItem.getQuantity() * product.getPriceMinor();
            }
            sellerOrder.setSubtotalMinor(subtotal);
            total += subtotal;
            order.getSellerOrders().add(sellerOrder);
        }
        order.setTotalMinor(total);
        orderRepository.save(order);

        // TODO PAYMENT : ici, appeler PaymentProvider.initiatePayment(order) au lieu du paiement physique.
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setStatus(PaymentStatus.PAYMENT_PENDING);
        payment.setAmountMinor(total);
        payment.setCurrency("XOF");
        paymentRepository.save(payment);

        // TODO COMMISSION : créer les lignes Commission par SellerOrder selon le taux configuré (Phase 1).
        recordHistory(order, null, null, OrderStatus.PENDING, user.id());
        for (SellerOrder so : order.getSellerOrders()) {
            recordHistory(order, so, null, OrderStatus.PENDING, user.id());
        }

        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();
        auditService.log(user.id(), "ORDER_CREATED", "Order", order.getId().toString(), "total=" + total, httpRequest);
        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderController.OrderResponse> listMine(CurrentUser user, Pageable pageable) {
        return orderRepository.findByBuyerId(user.id(), pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public OrderController.OrderResponse getMine(UUID id, CurrentUser user) {
        PurchaseOrder order = orderRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("ORDER_NOT_FOUND", "Commande introuvable"));
        if (!order.getBuyer().getId().equals(user.id()) && user.role() != Role.ADMIN) {
            throw ApiException.forbidden("Cette commande ne vous appartient pas");
        }
        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderController.SellerOrderResponse> listSellerOrders(CurrentUser user, Pageable pageable) {
        return sellerOrderRepository.findByShop_Seller_Id(user.id(), pageable).map(this::toSellerResponse);
    }

    @Transactional
    public OrderController.SellerOrderResponse updateSellerOrderStatus(UUID sellerOrderId, OrderStatus newStatus,
                                                                       CurrentUser user, HttpServletRequest httpRequest) {
        SellerOrder sellerOrder = sellerOrderRepository.findById(sellerOrderId)
                .orElseThrow(() -> ApiException.notFound("SELLER_ORDER_NOT_FOUND", "Sous-commande introuvable"));
        boolean owner = sellerOrder.getShop().getSeller().getId().equals(user.id());
        if (!owner && user.role() != Role.ADMIN) {
            // Isolation vendeur : un vendeur A ne voit jamais les commandes du vendeur B.
            throw ApiException.forbidden("Cette sous-commande ne vous appartient pas");
        }
        OrderStatus previous = sellerOrder.getStatus();
        sellerOrder.setStatus(newStatus);
        recordHistory(sellerOrder.getOrder(), sellerOrder, previous, newStatus, user.id());
        auditService.log(user.id(), "SELLER_ORDER_STATUS_CHANGED", "SellerOrder", sellerOrderId.toString(),
                previous + " -> " + newStatus, httpRequest);
        return toSellerResponse(sellerOrder);
    }

    private void recordHistory(PurchaseOrder order, SellerOrder sellerOrder, OrderStatus from, OrderStatus to, UUID changedBy) {
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order);
        history.setSellerOrder(sellerOrder);
        history.setFromStatus(from);
        history.setToStatus(to);
        history.setChangedBy(changedBy != null ? userRepository.getReferenceById(changedBy) : null);
        historyRepository.save(history);
    }

    OrderController.OrderResponse toResponse(PurchaseOrder order) {
        return new OrderController.OrderResponse(
                order.getId(),
                order.getStatus().name(),
                order.getTotalMinor(),
                order.getCurrency(),
                order.getLiveSessionId(),
                order.getCreatedAt(),
                order.getSellerOrders().stream().map(this::toSellerResponse).toList());
    }

    private OrderController.SellerOrderResponse toSellerResponse(SellerOrder sellerOrder) {
        return new OrderController.SellerOrderResponse(
                sellerOrder.getId(),
                sellerOrder.getOrder().getId(),
                sellerOrder.getShop().getId(),
                sellerOrder.getShop().getName(),
                sellerOrder.getStatus().name(),
                sellerOrder.getSubtotalMinor(),
                sellerOrder.getCurrency(),
                sellerOrder.getItems().stream()
                        .map(item -> new OrderController.OrderLineResponse(
                                item.getProduct().getId(),
                                item.getProductName(),
                                item.getQuantity(),
                                item.getUnitPriceMinor()))
                        .toList());
    }
}
