package com.ecommerce.controller;

import com.ecommerce.dto.response.InventoryResponse;
import com.ecommerce.service.InventoryService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
public class PublicInventoryController {

    private final InventoryService inventoryService;

    public PublicInventoryController(
            InventoryService inventoryService
    ) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<InventoryResponse>
            getProductAvailability(
                    @PathVariable Long productId
            ) {

        return ResponseEntity.ok(
                inventoryService
                        .getProductAvailability(productId)
        );
    }
}