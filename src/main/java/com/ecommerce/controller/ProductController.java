package com.ecommerce.controller;

import com.ecommerce.dto.response.ProductResponse;
import com.ecommerce.service.ProductService;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {

        return ResponseEntity.ok(
                productService.getAllActiveProducts()
        );
    }

    @GetMapping("/{productId}")
    public ResponseEntity<ProductResponse> getProductById(
            @PathVariable Long productId
    ) {

        return ResponseEntity.ok(
                productService.getActiveProductById(productId)
        );
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ProductResponse>> getProductsByCategory(
            @PathVariable Long categoryId
    ) {

        return ResponseEntity.ok(
                productService.getActiveProductsByCategory(categoryId)
        );
    }
}