package com.marketplace.shop;

import com.marketplace.security.CurrentUser;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ShopController {

    private final ShopService shopService;

    public record ShopRequest(
            @NotBlank @Size(max = 150) String name,
            String description,
            String slogan,
            String logoUrl,
            String bannerUrl,
            String phone,
            String email,
            String address) {
    }

    public record ShopResponse(
            UUID id,
            String name,
            String slug,
            String description,
            String slogan,
            String logoUrl,
            String bannerUrl,
            String phone,
            String email,
            String address,
            boolean active) {
    }

    @GetMapping("/api/v1/shops/{slug}")
    public ShopResponse getBySlug(@PathVariable String slug) {
        return shopService.getBySlug(slug);
    }

    @GetMapping("/api/v1/seller/shop")
    public ShopResponse getMine(@AuthenticationPrincipal CurrentUser user) {
        return shopService.getMine(user);
    }

    @PutMapping("/api/v1/seller/shop")
    public ShopResponse save(@Valid @RequestBody ShopRequest request,
                             @AuthenticationPrincipal CurrentUser user,
                             HttpServletRequest httpRequest) {
        return shopService.save(request, user, httpRequest);
    }
}
