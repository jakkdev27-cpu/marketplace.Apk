package com.marketplace.shop;

import com.marketplace.audit.AuditService;
import com.marketplace.entity.Shop;
import com.marketplace.exception.ApiException;
import com.marketplace.repository.ShopRepository;
import com.marketplace.security.CurrentUser;
import com.marketplace.util.SlugUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ShopService {

    private final ShopRepository shopRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public ShopController.ShopResponse getBySlug(String slug) {
        Shop shop = shopRepository.findBySlug(slug)
                .orElseThrow(() -> ApiException.notFound("SHOP_NOT_FOUND", "Boutique introuvable"));
        return toResponse(shop);
    }

    @Transactional(readOnly = true)
    public ShopController.ShopResponse getMine(CurrentUser user) {
        Shop shop = shopRepository.findBySellerId(user.id())
                .orElseThrow(() -> ApiException.notFound("SHOP_NOT_FOUND", "Vous n'avez pas encore de boutique"));
        return toResponse(shop);
    }

    @Transactional
    public ShopController.ShopResponse save(ShopController.ShopRequest request, CurrentUser user, HttpServletRequest httpRequest) {
        Shop shop = shopRepository.findBySellerId(user.id()).orElseGet(() -> {
            Shop created = new Shop();
            created.setSeller(userRepositoryRef(user));
            return created;
        });
        boolean isNew = shop.getId() == null;
        shop.setName(request.name().trim());
        if (isNew || shop.getSlug() == null) {
            shop.setSlug(uniqueSlug(request.name()));
        }
        shop.setDescription(request.description());
        shop.setSlogan(request.slogan());
        shop.setLogoUrl(request.logoUrl());
        shop.setBannerUrl(request.bannerUrl());
        shop.setPhone(request.phone());
        shop.setEmail(request.email());
        shop.setAddress(request.address());
        Shop saved = shopRepository.save(shop);
        auditService.log(user.id(), isNew ? "SHOP_CREATED" : "SHOP_UPDATED", "Shop", saved.getId().toString(), null, httpRequest);
        return toResponse(saved);
    }

    /** Le vendeur est déjà en session via le token ; on recharge la référence proprement. */
    private com.marketplace.entity.User userRepositoryRef(CurrentUser user) {
        // Shop.seller est ManyToOne : on utilise l'utilisateur courant via son id.
        com.marketplace.entity.User ref = new com.marketplace.entity.User();
        ref.setId(user.id());
        return ref;
    }

    private String uniqueSlug(String name) {
        String base = SlugUtils.slugify(name);
        String slug = base;
        int i = 1;
        while (shopRepository.existsBySlug(slug)) {
            slug = base + "-" + (++i);
        }
        return slug;
    }

    ShopController.ShopResponse toResponse(Shop shop) {
        return new ShopController.ShopResponse(
                shop.getId(),
                shop.getName(),
                shop.getSlug(),
                shop.getDescription(),
                shop.getSlogan(),
                shop.getLogoUrl(),
                shop.getBannerUrl(),
                shop.getPhone(),
                shop.getEmail(),
                shop.getAddress(),
                shop.isActive());
    }
}
