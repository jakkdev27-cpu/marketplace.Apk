package com.marketplace.repository;

import com.marketplace.entity.Shop;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ShopRepository extends JpaRepository<Shop, UUID> {

    Optional<Shop> findBySellerId(UUID sellerId);

    Optional<Shop> findBySlug(String slug);

    boolean existsBySlug(String slug);
}
