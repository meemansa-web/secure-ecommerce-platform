package com.ecommerce.repository;

import com.ecommerce.entity.Inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository
        extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByProductId(Long productId);

    boolean existsByProductId(Long productId);
    @Query("""
    	       SELECT i FROM Inventory i
    	       WHERE i.product.vendor.id = :vendorId
    	       AND i.quantity > 0
    	       AND i.quantity <= i.lowStockThreshold
    	       """)
    	List<Inventory> findLowStockByVendorId(
    	        @Param("vendorId") Long vendorId
    	);
}