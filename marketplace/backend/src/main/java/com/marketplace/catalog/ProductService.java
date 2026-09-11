package com.marketplace.catalog;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marketplace.entity.Category;
import com.marketplace.entity.Product;
import com.marketplace.entity.ProductStatus;
import com.marketplace.entity.Role;
import com.marketplace.entity.Shop;
import com.marketplace.exception.ApiException;
import com.marketplace.repository.CategoryRepository;
import com.marketplace.repository.ProductRepository;
import com.marketplace.repository.ShopRepository;
import com.marketplace.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ShopRepository shopRepository;
    private final CategoryRepository categoryRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public Page<ProductController.ProductResponse> listPublic(String q, UUID categoryId, Pageable pageable) {
        Page<Product> page;
        if (q != null && !q.isBlank()) {
            page = productRepository.search(q.trim(), pageable);
        } else if (categoryId != null) {
            page = productRepository.findByCategoryIdAndStatus(categoryId, ProductStatus.ACTIVE, pageable);
        } else {
            page = productRepository.findByStatus(ProductStatus.ACTIVE, pageable);
        }
        return page.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ProductController.ProductResponse getPublic(UUID id) {
        Product product = productRepository.findByIdAndStatus(id, ProductStatus.ACTIVE)
                .orElseThrow(() -> ApiException.notFound("PRODUCT_NOT_FOUND", "Produit introuvable"));
        return toResponse(product);
    }

    @Transactional(readOnly = true)
    public Page<ProductController.ProductResponse> listMine(CurrentUser user, Pageable pageable) {
        Shop shop = shopRepository.findBySellerId(user.id())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "SHOP_REQUIRED", "Créez d'abord votre boutique"));
        return productRepository.findByShopId(shop.getId(), pageable).map(this::toResponse);
    }

    @Transactional
    public ProductController.ProductResponse create(ProductController.ProductRequest request, CurrentUser user) {
        Shop shop = shopRepository.findBySellerId(user.id())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "SHOP_REQUIRED", "Créez d'abord votre boutique"));
        Product product = new Product();
        apply(product, request, shop);
        return toResponse(productRepository.save(product));
    }

    @Transactional
    public ProductController.ProductResponse update(UUID id, ProductController.ProductRequest request, CurrentUser user) {
        Product product = loadOwned(id, user);
        apply(product, request, product.getShop());
        return toResponse(productRepository.save(product));
    }

    @Transactional
    public void delete(UUID id, CurrentUser user) {
        // Suppression douce : les données commerciales ne sont jamais effacées en dur.
        Product product = loadOwned(id, user);
        product.setStatus(ProductStatus.ARCHIVED);
    }

    /** Isolation stricte des vendeurs : un vendeur A ne touche jamais aux produits du vendeur B. */
    private Product loadOwned(UUID id, CurrentUser user) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("PRODUCT_NOT_FOUND", "Produit introuvable"));
        boolean owner = product.getShop().getSeller().getId().equals(user.id());
        if (!owner && user.role() != Role.ADMIN) {
            throw ApiException.forbidden("Vous ne pouvez pas gérer ce produit");
        }
        return product;
    }

    private void apply(Product product, ProductController.ProductRequest request, Shop shop) {
        product.setShop(shop);
        product.setName(request.name().trim());
        product.setDescription(request.description());
        product.setPriceMinor(request.priceMinor());
        product.setOldPriceMinor(request.oldPriceMinor());
        product.setCurrency(request.currency() == null || request.currency().isBlank() ? "XOF" : request.currency());
        product.setStock(request.stock());
        product.setReference(request.reference());
        if (request.categoryId() != null) {
            Category category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> ApiException.notFound("CATEGORY_NOT_FOUND", "Catégorie introuvable"));
            product.setCategory(category);
        }
        product.setImages(writeImages(request.images()));
    }

    ProductController.ProductResponse toResponse(Product product) {
        return new ProductController.ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPriceMinor(),
                product.getOldPriceMinor(),
                product.getCurrency(),
                product.getStock(),
                product.getReference(),
                product.getShop().getId(),
                product.getShop().getName(),
                product.getCategory() != null ? product.getCategory().getId() : null,
                product.getCategory() != null ? product.getCategory().getName() : null,
                readImages(product.getImages()),
                product.getStatus().name(),
                product.getCreatedAt());
    }

    private String writeImages(List<String> images) {
        try {
            return objectMapper.writeValueAsString(images == null ? List.of() : images);
        } catch (Exception e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_IMAGES", "Liste d'images invalide");
        }
    }

    private List<String> readImages(String json) {
        try {
            return objectMapper.readValue(json == null ? "[]" : json, new TypeReference<>() {
            });
        } catch (Exception e) {
            return List.of();
        }
    }
}
