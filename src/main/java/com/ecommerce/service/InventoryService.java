package com.ecommerce.service;

import java.util.List;

import com.ecommerce.dto.request.InventoryRequest;
import com.ecommerce.dto.request.StockUpdateRequest;
import com.ecommerce.dto.response.InventoryResponse;

public interface InventoryService {

    InventoryResponse setInventory(
            String vendorEmail,
            Long productId,
            InventoryRequest request
    );
    InventoryResponse getInventory(
            String vendorEmail,
            Long productId
    );

    InventoryResponse increaseStock(
            String vendorEmail,
            Long productId,
            StockUpdateRequest request
    );

    InventoryResponse decreaseStock(
            String vendorEmail,
            Long productId,
            StockUpdateRequest request
    );
    
    List<InventoryResponse> getLowStockProducts(
            String vendorEmail
    );

    InventoryResponse getProductAvailability(
            Long productId
    );
}