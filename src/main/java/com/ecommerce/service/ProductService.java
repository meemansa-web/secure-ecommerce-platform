package com.ecommerce.service;

import java.util.List;

import com.ecommerce.dto.request.ProductRequest;
import com.ecommerce.dto.response.ProductResponse;

public interface ProductService {

    ProductResponse createProduct(
            String vendorEmail,
            ProductRequest request
    );
    ProductResponse getVendorProductById( String vendorEmail, Long productId );
    
    List<ProductResponse> getVendorProducts(String vendorEmail);
    
    ProductResponse updateVendorProduct(
            String vendorEmail,
            Long productId,
            ProductRequest request
    );
    
    ProductResponse deactivateProduct(
            String vendorEmail,
            Long productId
    );

    ProductResponse activateProduct(
            String vendorEmail,
            Long productId
    );
    List<ProductResponse> getAllActiveProducts();

    ProductResponse getActiveProductById(Long productId);

    List<ProductResponse> getActiveProductsByCategory(Long categoryId);
}

