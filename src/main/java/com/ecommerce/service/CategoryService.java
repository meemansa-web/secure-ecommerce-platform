package com.ecommerce.service;

import java.util.List;

import com.ecommerce.dto.request.CategoryRequest;
import com.ecommerce.dto.response.CategoryResponse;

public interface CategoryService {

    CategoryResponse createCategory(CategoryRequest request);
    List<CategoryResponse> getAllActiveCategories();
    CategoryResponse getCategoryById(Long id);
    CategoryResponse updateCategory(Long id, CategoryRequest request);
    CategoryResponse deactivateCategory(Long id);
    CategoryResponse activateCategory(Long id);
    List<CategoryResponse> getAllCategories();
}