package com.marketplace.cart;

import com.marketplace.security.CurrentUser;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    public record AddItemRequest(@NotNull UUID productId, @NotNull @Positive Integer quantity) {
    }

    public record QuantityRequest(@NotNull Integer quantity) {
    }

    public record CartItemResponse(
            UUID itemId,
            UUID productId,
            String name,
            long priceMinor,
            String currency,
            int quantity,
            int stock,
            UUID shopId,
            String shopName,
            String image) {
    }

    /** Le frontend regroupe les items par shopId pour l'affichage multivendeur. */
    public record CartResponse(List<CartItemResponse> items, long totalMinor, String currency) {
    }

    @GetMapping
    public CartResponse get(@AuthenticationPrincipal CurrentUser user) {
        return cartService.get(user);
    }

    @PostMapping("/items")
    public CartResponse add(@Valid @RequestBody AddItemRequest request, @AuthenticationPrincipal CurrentUser user) {
        return cartService.add(user, request);
    }

    @PatchMapping("/items/{itemId}")
    public CartResponse updateQuantity(@PathVariable UUID itemId,
                                       @Valid @RequestBody QuantityRequest request,
                                       @AuthenticationPrincipal CurrentUser user) {
        return cartService.updateQuantity(user, itemId, request.quantity());
    }

    @DeleteMapping("/items/{itemId}")
    public CartResponse remove(@PathVariable UUID itemId, @AuthenticationPrincipal CurrentUser user) {
        return cartService.remove(user, itemId);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void clear(@AuthenticationPrincipal CurrentUser user) {
        cartService.clear(user);
    }
}
