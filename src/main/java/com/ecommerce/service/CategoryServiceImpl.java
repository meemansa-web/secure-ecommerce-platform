package com.ecommerce.service;

import com.ecommerce.dto.request.CategoryRequest;
import com.ecommerce.dto.response.CategoryResponse;
import com.ecommerce.entity.Category;
import com.ecommerce.exception.CategoryNotFoundException;
import com.ecommerce.exception.ResourceAlreadyExistsException;
import com.ecommerce.repository.CategoryRepository;

import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public CategoryResponse createCategory(CategoryRequest request) {

        String categoryName = request.getName().trim();

        if (categoryRepository.existsByNameIgnoreCase(categoryName)) {
            throw new ResourceAlreadyExistsException(
                    "Category already exists with name: " + categoryName
            );
        }

        Category category = new Category();

        category.setName(categoryName);
        category.setDescription(
                request.getDescription() != null
                        ? request.getDescription().trim()
                        : null
        );

        category.setActive(true);

        Category savedCategory =
                categoryRepository.save(category);

        return mapToResponse(savedCategory);
    }

    private CategoryResponse mapToResponse(Category category) {

        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.isActive(),
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }
    @Override
    public List<CategoryResponse> getAllActiveCategories() {

        return categoryRepository.findByActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
    @Override
    public CategoryResponse getCategoryById(Long id) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new CategoryNotFoundException(
                                "Category not found with id: " + id
                        )
                );

        if (!category.isActive()) {
            throw new CategoryNotFoundException(
                    "Category not found with id: " + id
            );
        }

        return mapToResponse(category);
    }
    @Override
    public CategoryResponse updateCategory(
            Long id,
            CategoryRequest request
    ) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new CategoryNotFoundException(
                                "Category not found with id: " + id
                        )
                );

        String newName = request.getName().trim();

        if (!category.getName().equalsIgnoreCase(newName)
                && categoryRepository.existsByNameIgnoreCase(newName)) {

            throw new ResourceAlreadyExistsException(
                    "Category already exists with name: " + newName
            );
        }

        category.setName(newName);

        category.setDescription(
                request.getDescription() != null
                        ? request.getDescription().trim()
                        : null
        );

        Category updatedCategory =
                categoryRepository.save(category);

        return mapToResponse(updatedCategory);
    }
    @Override
    public CategoryResponse deactivateCategory(Long id) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new CategoryNotFoundException(
                                "Category not found with id: " + id
                        )
                );

        if (!category.isActive()) {
            throw new IllegalArgumentException(
                    "Category is already inactive"
            );
        }

        category.setActive(false);

        Category updatedCategory =
                categoryRepository.save(category);

        return mapToResponse(updatedCategory);
    }
    @Override
    public CategoryResponse activateCategory(Long id) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new CategoryNotFoundException(
                                "Category not found with id: " + id
                        )
                );

        if (category.isActive()) {
            throw new IllegalArgumentException(
                    "Category is already active"
            );
        }

        category.setActive(true);

        Category updatedCategory =
                categoryRepository.save(category);

        return mapToResponse(updatedCategory);
    }
    @Override
    public List<CategoryResponse> getAllCategories() {

        return categoryRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
}