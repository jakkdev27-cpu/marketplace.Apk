package com.marketplace.catalog;

import com.marketplace.entity.Category;
import com.marketplace.exception.ApiException;
import com.marketplace.repository.CategoryRepository;
import com.marketplace.util.SlugUtils;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;

    public record CategoryRequest(
            @NotBlank @Size(max = 120) String name,
            String description,
            String imageUrl) {
    }

    public record CategoryResponse(UUID id, String name, String slug, String description, String imageUrl) {
    }

    @GetMapping("/api/v1/categories")
    public List<CategoryResponse> list() {
        return categoryRepository.findByActiveTrueOrderByNameAsc().stream().map(this::toResponse).toList();
    }

    @PostMapping("/api/v1/admin/categories")
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponse create(@Valid @RequestBody CategoryRequest request) {
        Category category = new Category();
        apply(category, request);
        return toResponse(categoryRepository.save(category));
    }

    @PutMapping("/api/v1/admin/categories/{id}")
    public CategoryResponse update(@PathVariable UUID id, @Valid @RequestBody CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("CATEGORY_NOT_FOUND", "Catégorie introuvable"));
        apply(category, request);
        return toResponse(categoryRepository.save(category));
    }

    @DeleteMapping("/api/v1/admin/categories/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable UUID id) {
        // Désactivation douce : les produits liés restent historisés.
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("CATEGORY_NOT_FOUND", "Catégorie introuvable"));
        category.setActive(false);
    }

    private void apply(Category category, CategoryRequest request) {
        category.setName(request.name().trim());
        if (category.getSlug() == null) {
            category.setSlug(uniqueSlug(request.name()));
        }
        category.setDescription(request.description());
        category.setImageUrl(request.imageUrl());
    }

    private String uniqueSlug(String name) {
        String base = SlugUtils.slugify(name);
        String slug = base;
        int i = 1;
        while (categoryRepository.existsBySlug(slug)) {
            slug = base + "-" + (++i);
        }
        return slug;
    }

    private CategoryResponse toResponse(Category category) {
        return new CategoryResponse(category.getId(), category.getName(), category.getSlug(),
                category.getDescription(), category.getImageUrl());
    }
}
