package com.marketplace.order;

import com.marketplace.entity.OrderStatus;
import com.marketplace.security.CurrentUser;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/seller-orders")
@RequiredArgsConstructor
public class SellerOrderController {

    private final OrderService orderService;

    public record StatusUpdateRequest(@NotBlank String status) {
    }

    @GetMapping
    public Page<OrderController.SellerOrderResponse> listMine(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal CurrentUser user) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 50), Sort.by(Sort.Direction.DESC, "createdAt"));
        return orderService.listSellerOrders(user, pageable);
    }

    @PatchMapping("/{id}/status")
    public OrderController.SellerOrderResponse updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody StatusUpdateRequest request,
            @AuthenticationPrincipal CurrentUser user,
            HttpServletRequest httpRequest) {
        OrderStatus status;
        try {
            status = OrderStatus.valueOf(request.status().trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new com.marketplace.exception.ApiException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "INVALID_STATUS", "Statut inconnu : " + request.status());
        }
        return orderService.updateSellerOrderStatus(id, status, user, httpRequest);
    }
}
