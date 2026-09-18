package com.ecommerce.service;

import com.ecommerce.dto.request.InventoryRequest;
import com.ecommerce.dto.request.StockUpdateRequest;
import com.ecommerce.dto.response.InventoryResponse;
import com.ecommerce.entity.Inventory;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.User;
import com.ecommerce.entity.Vendor;
import com.ecommerce.exception.InventoryNotFoundException;
import com.ecommerce.exception.ProductNotFoundException;
import com.ecommerce.exception.UserNotFoundException;
import com.ecommerce.exception.VendorNotFoundException;
import com.ecommerce.repository.InventoryRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.repository.VendorRepository;
import com.ecommerce.service.InventoryService;

import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;

    public InventoryServiceImpl(
            InventoryRepository inventoryRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            VendorRepository vendorRepository
    ) {
        this.inventoryRepository = inventoryRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.vendorRepository = vendorRepository;
    }

    @Override
    public InventoryResponse setInventory(
            String vendorEmail,
            Long productId,
            InventoryRequest request
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

        // Vendor can manage only their own product
        if (!product.getVendor().getId().equals(vendor.getId())) {
            throw new ProductNotFoundException(
                    "Product not found with id: " + productId
            );
        }

        Inventory inventory = inventoryRepository
                .findByProductId(productId)
                .orElseGet(() -> {
                    Inventory newInventory = new Inventory();
                    newInventory.setProduct(product);
                    return newInventory;
                });

        inventory.setQuantity(request.getQuantity());

        inventory.setLowStockThreshold(
                request.getLowStockThreshold()
        );

        Inventory savedInventory =
                inventoryRepository.save(inventory);

        return mapToResponse(savedInventory);
    }

    private InventoryResponse mapToResponse(
            Inventory inventory
    ) {

        int quantity = inventory.getQuantity();
        int threshold = inventory.getLowStockThreshold();

        boolean inStock = quantity > 0;

        boolean lowStock =
                quantity > 0 && quantity <= threshold;

        return new InventoryResponse(
                inventory.getId(),
                inventory.getProduct().getId(),
                inventory.getProduct().getName(),
                quantity,
                threshold,
                lowStock,
                inStock,
                inventory.getCreatedAt(),
                inventory.getUpdatedAt()
        );
    }
    @Override
    public InventoryResponse getInventory(
            String vendorEmail,
            Long productId
    ) {

        Vendor vendor = getVendor(vendorEmail);

        Product product = getVendorProduct(
                vendor,
                productId
        );

        Inventory inventory = inventoryRepository
                .findByProductId(product.getId())
                .orElseThrow(() ->
                        new InventoryNotFoundException(
                                "Inventory not found for product id: "
                                        + productId
                        )
                );

        return mapToResponse(inventory);
    }
    @Override
    public InventoryResponse increaseStock(
            String vendorEmail,
            Long productId,
            StockUpdateRequest request
    ) {

        Vendor vendor = getVendor(vendorEmail);

        Product product = getVendorProduct(
                vendor,
                productId
        );

        Inventory inventory = inventoryRepository
                .findByProductId(product.getId())
                .orElseThrow(() ->
                        new InventoryNotFoundException(
                                "Inventory not found for product id: "
                                        + productId
                        )
                );

        int newQuantity =
                inventory.getQuantity()
                        + request.getQuantity();

        inventory.setQuantity(newQuantity);

        Inventory savedInventory =
                inventoryRepository.save(inventory);

        return mapToResponse(savedInventory);
    }
    @Override
    public InventoryResponse decreaseStock(
            String vendorEmail,
            Long productId,
            StockUpdateRequest request
    ) {

        Vendor vendor = getVendor(vendorEmail);

        Product product = getVendorProduct(
                vendor,
                productId
        );

        Inventory inventory = inventoryRepository
                .findByProductId(product.getId())
                .orElseThrow(() ->
                        new InventoryNotFoundException(
                                "Inventory not found for product id: "
                                        + productId
                        )
                );

        if (inventory.getQuantity() < request.getQuantity()) {

            throw new IllegalArgumentException(
                    "Insufficient stock. Available quantity: "
                            + inventory.getQuantity()
            );
        }

        int newQuantity =
                inventory.getQuantity()
                        - request.getQuantity();

        inventory.setQuantity(newQuantity);

        Inventory savedInventory =
                inventoryRepository.save(inventory);

        return mapToResponse(savedInventory);
    }
    private Vendor getVendor(String vendorEmail) {

        User user = userRepository
                .findByEmail(vendorEmail.toLowerCase())
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "Vendor user not found"
                        )
                );

        return vendorRepository
                .findByUserId(user.getId())
                .orElseThrow(() ->
                        new VendorNotFoundException(
                                "Vendor profile not found"
                        )
                );
    }

    private Product getVendorProduct(
            Vendor vendor,
            Long productId
    ) {

        Product product = productRepository
                .findById(productId)
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found with id: "
                                        + productId
                        )
                );

        if (!product.getVendor().getId().equals(vendor.getId())) {

            throw new ProductNotFoundException(
                    "Product not found with id: "
                            + productId
            );
        }

        return product;
    }
    @Override
    public List<InventoryResponse> getLowStockProducts(
            String vendorEmail
    ) {

        Vendor vendor = getVendor(vendorEmail);

        return inventoryRepository
                .findLowStockByVendorId(vendor.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
    @Override
    public InventoryResponse getProductAvailability(
            Long productId
    ) {

        Product product = productRepository
                .findById(productId)
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found with id: " + productId
                        )
                );

        // Public should not see inactive products
        if (!product.isActive()
                || !product.getCategory().isActive()) {

            throw new ProductNotFoundException(
                    "Product not found with id: " + productId
            );
        }

        Inventory inventory = inventoryRepository
                .findByProductId(productId)
                .orElseThrow(() ->
                        new InventoryNotFoundException(
                                "Inventory not found for product id: "
                                        + productId
                        )
                );

        return mapToResponse(inventory);
    }
}