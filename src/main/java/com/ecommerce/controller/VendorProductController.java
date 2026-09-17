package com.ecommerce.controller;

import com.ecommerce.dto.request.ProductRequest;
import com.ecommerce.dto.response.ProductResponse;
import com.ecommerce.service.ProductService;

import jakarta.validation.Valid;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vendor/products")
public class VendorProductController {

    private final ProductService productService;

    public VendorProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(
            Authentication authentication,
            @Valid @RequestBody ProductRequest request
    ) {

        String vendorEmail = authentication.getName();

        ProductResponse response =
                productService.createProduct(
                        vendorEmail,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getVendorProducts(
            Authentication authentication
    ) {

        String vendorEmail = authentication.getName();

        return ResponseEntity.ok(
                productService.getVendorProducts(vendorEmail)
        );
    }
    
    @GetMapping("/{productId}")
    public ResponseEntity<ProductResponse> getVendorProductById(
            Authentication authentication,
            @PathVariable Long productId
    ) {

        String vendorEmail = authentication.getName();

        return ResponseEntity.ok(
                productService.getVendorProductById(
                        vendorEmail,
                        productId
                )
        );
    }
    
    @PutMapping("/{productId}")
    public ResponseEntity<ProductResponse> updateProduct(
            Authentication authentication,
            @PathVariable Long productId,
            @Valid @RequestBody ProductRequest request
    ) {

        String vendorEmail = authentication.getName();

        return ResponseEntity.ok(
                productService.updateVendorProduct(
                        vendorEmail,
                        productId,
                        request
                )
        );
    }
    @PutMapping("/{productId}/deactivate")
    public ResponseEntity<ProductResponse> deactivateProduct(
            Authentication authentication,
            @PathVariable Long productId
    ) {

        String vendorEmail = authentication.getName();

        return ResponseEntity.ok(
                productService.deactivateProduct(
                        vendorEmail,
                        productId
                )
        );
    }
    @PutMapping("/{productId}/activate")
    public ResponseEntity<ProductResponse> activateProduct(
            Authentication authentication,
            @PathVariable Long productId
    ) {

        String vendorEmail = authentication.getName();

        return ResponseEntity.ok(
                productService.activateProduct(
                        vendorEmail,
                        productId
                )
        );
        
        
    }
}