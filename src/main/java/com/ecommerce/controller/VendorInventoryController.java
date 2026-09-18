package com.ecommerce.controller;

import com.ecommerce.dto.request.InventoryRequest;
import com.ecommerce.dto.request.StockUpdateRequest;
import com.ecommerce.dto.response.InventoryResponse;
import com.ecommerce.service.InventoryService;

import jakarta.validation.Valid;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vendor/inventory")
public class VendorInventoryController {

    private final InventoryService inventoryService;

    public VendorInventoryController(
            InventoryService inventoryService
    ) {
        this.inventoryService = inventoryService;
    }

    @PutMapping("/{productId}")
    public ResponseEntity<InventoryResponse> setInventory(
            Authentication authentication,
            @PathVariable Long productId,
            @Valid @RequestBody InventoryRequest request
    ) {

        String vendorEmail = authentication.getName();

        return ResponseEntity.ok(
                inventoryService.setInventory(
                        vendorEmail,
                        productId,
                        request
                )
        );
    }
    @GetMapping("/{productId}")
    public ResponseEntity<InventoryResponse> getInventory(
            Authentication authentication,
            @PathVariable Long productId
    ) {

        String vendorEmail = authentication.getName();

        return ResponseEntity.ok(
                inventoryService.getInventory(
                        vendorEmail,
                        productId
                )
        );
    }
    @PutMapping("/{productId}/increase")
    public ResponseEntity<InventoryResponse> increaseStock(
            Authentication authentication,
            @PathVariable Long productId,
            @Valid @RequestBody StockUpdateRequest request
    ) {

        String vendorEmail = authentication.getName();

        return ResponseEntity.ok(
                inventoryService.increaseStock(
                        vendorEmail,
                        productId,
                        request
                )
        );
    }
    @PutMapping("/{productId}/decrease")
    public ResponseEntity<InventoryResponse> decreaseStock(
            Authentication authentication,
            @PathVariable Long productId,
            @Valid @RequestBody StockUpdateRequest request
    ) {

        String vendorEmail = authentication.getName();

        return ResponseEntity.ok(
                inventoryService.decreaseStock(
                        vendorEmail,
                        productId,
                        request
                )
        );
    }
    @GetMapping("/low-stock")
    public ResponseEntity<List<InventoryResponse>>
            getLowStockProducts(
                    Authentication authentication
            ) {

        String vendorEmail = authentication.getName();

        return ResponseEntity.ok(
                inventoryService.getLowStockProducts(
                        vendorEmail
                )
        );
    }
}