package com.ecommerce.dto.response;

import java.time.LocalDateTime;

public class InventoryResponse {

    private Long inventoryId;
    private Long productId;
    private String productName;
    private Integer quantity;
    private Integer lowStockThreshold;
    private boolean lowStock;
    private boolean inStock;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public InventoryResponse(
            Long inventoryId,
            Long productId,
            String productName,
            Integer quantity,
            Integer lowStockThreshold,
            boolean lowStock,
            boolean inStock,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        this.inventoryId = inventoryId;
        this.productId = productId;
        this.productName = productName;
        this.quantity = quantity;
        this.lowStockThreshold = lowStockThreshold;
        this.lowStock = lowStock;
        this.inStock = inStock;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getInventoryId() {
        return inventoryId;
    }

    public Long getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public Integer getLowStockThreshold() {
        return lowStockThreshold;
    }

    public boolean isLowStock() {
        return lowStock;
    }

    public boolean isInStock() {
        return inStock;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}