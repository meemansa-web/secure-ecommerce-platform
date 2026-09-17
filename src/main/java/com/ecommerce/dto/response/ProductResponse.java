package com.ecommerce.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProductResponse {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private boolean active;

    private Long categoryId;
    private String categoryName;

    private Long vendorId;
    private String vendorName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ProductResponse() {
    }

    public ProductResponse(
            Long id,
            String name,
            String description,
            BigDecimal price,
            boolean active,
            Long categoryId,
            String categoryName,
            Long vendorId,
            String vendorName,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.active = active;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.vendorId = vendorId;
        this.vendorName = vendorName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public boolean isActive() {
        return active;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public Long getVendorId() {
        return vendorId;
    }

    public String getVendorName() {
        return vendorName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
