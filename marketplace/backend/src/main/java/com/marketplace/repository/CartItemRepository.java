package com.marketplace.repository;

import com.marketplace.entity.Cart;
import com.marketplace.entity.CartItem;
import com.marketplace.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CartItemRepository extends JpaRepository<CartItem, UUID> {

    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);
}
