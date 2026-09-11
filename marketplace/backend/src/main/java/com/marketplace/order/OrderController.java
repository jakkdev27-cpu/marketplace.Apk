package com.marketplace.order;

import com.marketplace.security.CurrentUser;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    public record OrderLineResponse(UUID productId, String productName, int quantity, long unitPriceMinor) {
    }

    public record SellerOrderResponse(
            UUID id,
            UUID orderId,
            UUID shopId,
            String shopName,
            String status,
            long subtotalMinor,
            String currency,
            List<OrderLineResponse> items) {
    }

    public record OrderResponse(
            UUID id,
            String status,
            long totalMinor,
            String currency,
            UUID liveSessionId,
            Instant createdAt,
            List<SellerOrderResponse> sellerOrders) {
    }

    @PostMapping("/checkout")
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse checkout(@AuthenticationPrincipal CurrentUser user, HttpServletRequest httpRequest) {
        return orderService.checkout(user, httpRequest);
    }

    @GetMapping
    public Page<OrderResponse> listMine(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal CurrentUser user) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 50), Sort.by(Sort.Direction.DESC, "createdAt"));
        return orderService.listMine(user, pageable);
    }

    @GetMapping("/{id}")
    public OrderResponse getMine(@PathVariable UUID id, @AuthenticationPrincipal CurrentUser user) {
        return orderService.getMine(id, user);
    }
}
