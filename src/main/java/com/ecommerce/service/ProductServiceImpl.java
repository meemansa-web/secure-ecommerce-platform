package com.ecommerce.service;

import com.ecommerce.dto.request.ProductRequest;
import com.ecommerce.dto.response.ProductResponse;
import com.ecommerce.entity.Category;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.User;
import com.ecommerce.entity.Vendor;
import com.ecommerce.enums.VendorStatus;
import com.ecommerce.exception.CategoryNotFoundException;
import com.ecommerce.exception.ProductNotFoundException;
import com.ecommerce.exception.UserNotFoundException;
import com.ecommerce.exception.VendorNotFoundException;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.repository.VendorRepository;

import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;

    public ProductServiceImpl(
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            UserRepository userRepository,
            VendorRepository vendorRepository
    ) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.vendorRepository = vendorRepository;
    }

    @Override
    public ProductResponse createProduct(
            String vendorEmail,
            ProductRequest request
    ) {

        User user = userRepository
                .findByEmail(vendorEmail.toLowerCase())
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "Vendor user not found"
                        )
                );

        Vendor vendor = vendorRepository
                .findByUserId(user.getId())
                .orElseThrow(() ->
                        new VendorNotFoundException(
                                "Vendor profile not found"
                        )
                );

        if (vendor.getStatus() != VendorStatus.APPROVED) {
            throw new IllegalArgumentException(
                    "Only approved vendors can create products"
            );
        }

        Category category = categoryRepository
                .findById(request.getCategoryId())
                .orElseThrow(() ->
                        new CategoryNotFoundException(
                                "Category not found with id: "
                                        + request.getCategoryId()
                        )
                );

        if (!category.isActive()) {
            throw new IllegalArgumentException(
                    "Cannot add product to an inactive category"
            );
        }

        Product product = new Product();

        product.setName(request.getName().trim());

        product.setDescription(
                request.getDescription() != null
                        ? request.getDescription().trim()
                        : null
        );

        product.setPrice(request.getPrice());
        product.setCategory(category);
        product.setVendor(vendor);
        product.setActive(true);

        Product savedProduct =
                productRepository.save(product);

        return mapToResponse(savedProduct);
    }

    private ProductResponse mapToResponse(Product product) {

        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.isActive(),
                product.getCategory().getId(),
                product.getCategory().getName(),
                product.getVendor().getId(),
                product.getVendor().getBusinessName(),
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }
    @Override
    public List<ProductResponse> getVendorProducts(String vendorEmail) {

        User user = userRepository
                .findByEmail(vendorEmail.toLowerCase())
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "Vendor user not found"
                        )
                );

        Vendor vendor = vendorRepository
                .findByUserId(user.getId())
                .orElseThrow(() ->
                        new VendorNotFoundException(
                                "Vendor profile not found"
                        )
                );

        if (vendor.getStatus() != VendorStatus.APPROVED) {
            throw new IllegalArgumentException(
                    "Only approved vendors can view products"
            );
        }

        return productRepository
                .findByVendorId(vendor.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
    @Override
    public ProductResponse getVendorProductById(
            String vendorEmail,
            Long productId
    ) {

        User user = userRepository
                .findByEmail(vendorEmail.toLowerCase())
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "Vendor user not found"
                        )
                );

        Vendor vendor = vendorRepository
                .findByUserId(user.getId())
                .orElseThrow(() ->
                        new VendorNotFoundException(
                                "Vendor profile not found"
                        )
                );

        Product product = productRepository
                .findById(productId)
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found with id: " + productId
                        )
                );

        // Ownership validation
        if (!product.getVendor().getId().equals(vendor.getId())) {
            throw new ProductNotFoundException(
                    "Product not found with id: " + productId
            );
        }

        return mapToResponse(product);
    }
    
    @Override
    public ProductResponse updateVendorProduct(
            String vendorEmail,
            Long productId,
            ProductRequest request
    ) {

        User user = userRepository
                .findByEmail(vendorEmail.toLowerCase())
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "Vendor user not found"
                        )
                );

        Vendor vendor = vendorRepository
                .findByUserId(user.getId())
                .orElseThrow(() ->
                        new VendorNotFoundException(
                                "Vendor profile not found"
                        )
                );

        Product product = productRepository
                .findById(productId)
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found with id: " + productId
                        )
                );

        // Check product ownership
        if (!product.getVendor().getId().equals(vendor.getId())) {
            throw new ProductNotFoundException(
                    "Product not found with id: " + productId
            );
        }

        Category category = categoryRepository
                .findById(request.getCategoryId())
                .orElseThrow(() ->
                        new CategoryNotFoundException(
                                "Category not found with id: "
                                        + request.getCategoryId()
                        )
                );

        if (!category.isActive()) {
            throw new IllegalArgumentException(
                    "Cannot assign product to an inactive category"
            );
        }

        product.setName(request.getName().trim());

        product.setDescription(
                request.getDescription() != null
                        ? request.getDescription().trim()
                        : null
        );

        product.setPrice(request.getPrice());

        product.setCategory(category);

        Product updatedProduct =
                productRepository.save(product);

        return mapToResponse(updatedProduct);
    }
    @Override
    public ProductResponse deactivateProduct(
            String vendorEmail,
            Long productId
    ) {

        User user = userRepository
                .findByEmail(vendorEmail.toLowerCase())
                .orElseThrow(() ->
                        new UserNotFoundException("Vendor user not found")
                );

        Vendor vendor = vendorRepository
                .findByUserId(user.getId())
                .orElseThrow(() ->
                        new VendorNotFoundException("Vendor profile not found")
                );

        Product product = productRepository
                .findById(productId)
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found with id: " + productId
                        )
                );

        if (!product.getVendor().getId().equals(vendor.getId())) {
            throw new ProductNotFoundException(
                    "Product not found with id: " + productId
            );
        }

        if (!product.isActive()) {
            throw new IllegalArgumentException(
                    "Product is already inactive"
            );
        }

        product.setActive(false);

        Product updatedProduct = productRepository.save(product);

        return mapToResponse(updatedProduct);
    }
    
    @Override
    public ProductResponse activateProduct(
            String vendorEmail,
            Long productId
    ) {

        User user = userRepository
                .findByEmail(vendorEmail.toLowerCase())
                .orElseThrow(() ->
                        new UserNotFoundException("Vendor user not found")
                );

        Vendor vendor = vendorRepository
                .findByUserId(user.getId())
                .orElseThrow(() ->
                        new VendorNotFoundException("Vendor profile not found")
                );

        Product product = productRepository
                .findById(productId)
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found with id: " + productId
                        )
                );

        if (!product.getVendor().getId().equals(vendor.getId())) {
            throw new ProductNotFoundException(
                    "Product not found with id: " + productId
            );
        }

        if (product.isActive()) {
            throw new IllegalArgumentException(
                    "Product is already active"
            );
        }

        // Category bhi active honi chahiye
        if (!product.getCategory().isActive()) {
            throw new IllegalArgumentException(
                    "Cannot activate product because category is inactive"
            );
        }

        product.setActive(true);

        Product updatedProduct = productRepository.save(product);

        return mapToResponse(updatedProduct);
    }
    
    @Override
    public List<ProductResponse> getAllActiveProducts() {

        return productRepository
                .findByActiveTrue()
                .stream()
                .filter(product -> product.getCategory().isActive())
                .map(this::mapToResponse)
                .toList();
    }
    
    @Override
    public ProductResponse getActiveProductById(Long productId) {

        Product product = productRepository
                .findById(productId)
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found with id: " + productId
                        )
                );

        if (!product.isActive() || !product.getCategory().isActive()) {
            throw new ProductNotFoundException(
                    "Product not found with id: " + productId
            );
        }

        return mapToResponse(product);
    }
    
    @Override
    public List<ProductResponse> getActiveProductsByCategory(
            Long categoryId
    ) {

        Category category = categoryRepository
                .findById(categoryId)
                .orElseThrow(() ->
                        new CategoryNotFoundException(
                                "Category not found with id: " + categoryId
                        )
                );

        if (!category.isActive()) {
            throw new CategoryNotFoundException(
                    "Category not found with id: " + categoryId
            );
        }

        return productRepository
                .findByCategoryIdAndActiveTrue(categoryId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
    
    
}
