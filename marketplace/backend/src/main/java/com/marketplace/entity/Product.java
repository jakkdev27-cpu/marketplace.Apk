package com.marketplace.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "products")
@Getter
@Setter
public class Product extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "shop_id", nullable = false)
    private Shop shop;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** Prix en unités mineures entières (ex : centimes) pour éviter les erreurs d'arrondi. */
    @Column(name = "price_minor", nullable = false)
    private long priceMinor;

    @Column(name = "old_price_minor")
    private Long oldPriceMinor;

    @Column(nullable = false, length = 8)
    private String currency = "XOF";

    @Column(nullable = false)
    private int stock = 0;

    @Column(name = "low_stock_threshold", nullable = false)
    private int lowStockThreshold = 5;

    @Column(length = 100)
    private String reference;

    /** URLs d'images sérialisées en JSON. TODO : remplacer par une entité ProductImage + StorageProvider. */
    @Column(columnDefinition = "TEXT")
    private String images = "[]";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProductStatus status = ProductStatus.ACTIVE;

    /** Verrou optimiste : protège le stock et les mises à jour concurrentes. */
    @Version
    @Column(nullable = false)
    private long version;
}
