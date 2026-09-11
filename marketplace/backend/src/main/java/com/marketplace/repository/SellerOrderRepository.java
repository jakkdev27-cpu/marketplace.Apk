package com.marketplace.repository;

import com.marketplace.entity.SellerOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SellerOrderRepository extends JpaRepository<SellerOrder, UUID> {

    Page<SellerOrder> findByShop_Seller_Id(UUID sellerId, Pageable pageable);
}
