package com.marketplace.cart;

import com.marketplace.entity.Cart;
import com.marketplace.entity.CartItem;
import com.marketplace.entity.Product;
import com.marketplace.entity.ProductStatus;
import com.marketplace.entity.User;
import com.marketplace.exception.ApiException;
import com.marketplace.repository.CartItemRepository;
import com.marketplace.repository.CartRepository;
import com.marketplace.repository.ProductRepository;
import com.marketplace.repository.UserRepository;
import com.marketplace.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public CartController.CartResponse get(CurrentUser user) {
        return toResponse(cartOf(user));
    }

    @Transactional
    public CartController.CartResponse add(CurrentUser user, CartController.AddItemRequest request) {
        Product product = productRepository.findById(request.productId())
                .filter(p -> p.getStatus() == ProductStatus.ACTIVE)
                .orElseThrow(() -> ApiException.notFound("PRODUCT_NOT_FOUND", "Produit introuvable"));
        Cart cart = cartOf(user);
        CartItem item = cartItemRepository.findByCartAndProduct(cart, product)
                .orElseGet(() -> {
                    CartItem created = new CartItem();
                    created.setCart(cart);
                    created.setProduct(product);
                    created.setQuantity(0);
                    return created;
                });
        int newQuantity = item.getQuantity() + request.quantity();
        ensureStock(product, newQuantity);
        item.setQuantity(newQuantity);
        cartItemRepository.save(item);
        return toResponse(cart);
    }

    @Transactional
    public CartController.CartResponse updateQuantity(CurrentUser user, java.util.UUID itemId, int quantity) {
        CartItem item = ownedItem(user, itemId);
        if (quantity <= 0) {
            cartItemRepository.delete(item);
            return toResponse(item.getCart());
        }
        ensureStock(item.getProduct(), quantity);
        item.setQuantity(quantity);
        return toResponse(item.getCart());
    }

    @Transactional
    public CartController.CartResponse remove(CurrentUser user, java.util.UUID itemId) {
        CartItem item = ownedItem(user, itemId);
        Cart cart = item.getCart();
        cartItemRepository.delete(item);
        return toResponse(cart);
    }

    @Transactional
    public void clear(CurrentUser user) {
        Cart cart = cartOf(user);
        cart.getItems().clear();
    }

    private CartItem ownedItem(CurrentUser user, java.util.UUID itemId) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> ApiException.notFound("CART_ITEM_NOT_FOUND", "Ligne de panier introuvable"));
        if (!item.getCart().getBuyer().getId().equals(user.id())) {
            throw ApiException.forbidden("Ce panier ne vous appartient pas");
        }
        return item;
    }

    private void ensureStock(Product product, int quantity) {
        if (product.getStock() < quantity) {
            throw new ApiException(HttpStatus.CONFLICT, "INSUFFICIENT_STOCK",
                    "Stock insuffisant pour « " + product.getName() + " » (disponible : " + product.getStock() + ")");
        }
    }

    private Cart cartOf(CurrentUser user) {
        return cartRepository.findByBuyerId(user.id())
                .orElseGet(() -> {
                    Cart created = new Cart();
                    User buyer = userRepository.getReferenceById(user.id());
                    created.setBuyer(buyer);
                    return cartRepository.save(created);
                });
    }

    private CartController.CartResponse toResponse(Cart cart) {
        List<CartController.CartItemResponse> items = cart.getItems().stream()
                .map(item -> {
                    Product p = item.getProduct();
                    String image = null;
                    try {
                        com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper();
                        List<String> imgs = om.readValue(p.getImages(), new com.fasterxml.jackson.core.type.TypeReference<>() {
                        });
                        image = imgs.isEmpty() ? null : imgs.get(0);
                    } catch (Exception ignored) {
                        // image optionnelle
                    }
                    return new CartController.CartItemResponse(
                            item.getId(),
                            p.getId(),
                            p.getName(),
                            p.getPriceMinor(),
                            p.getCurrency(),
                            item.getQuantity(),
                            p.getStock(),
                            p.getShop().getId(),
                            p.getShop().getName(),
                            image);
                })
                .toList();
        long total = items.stream().mapToLong(i -> i.priceMinor() * i.quantity()).sum();
        return new CartController.CartResponse(items, total, items.isEmpty() ? "XOF" : items.get(0).currency());
    }
}
