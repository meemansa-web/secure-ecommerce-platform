package com.ecommerce.service;

import com.ecommerce.dto.request.CreateOrderRequest;
import com.ecommerce.dto.request.OrderItemRequest;
import com.ecommerce.dto.response.OrderItemResponse;
import com.ecommerce.dto.response.OrderResponse;
import com.ecommerce.dto.response.PaymentResponse;
import com.ecommerce.entity.Inventory;
import com.ecommerce.entity.Order;
import com.ecommerce.entity.OrderItem;
import com.ecommerce.entity.Payment;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.User;
import com.ecommerce.enums.OrderStatus;
import com.ecommerce.enums.PaymentMethod;
import com.ecommerce.enums.PaymentStatus;
import com.ecommerce.exception.ProductNotFoundException;
import com.ecommerce.exception.UserNotFoundException;
import com.ecommerce.repository.InventoryRepository;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderServiceImpl.class);

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final UserRepository userRepository;
    private final EmailSenderService emailSenderService;

    public OrderServiceImpl(
            OrderRepository orderRepository,
            ProductRepository productRepository,
            InventoryRepository inventoryRepository,
            UserRepository userRepository,
            EmailSenderService emailSenderService
    ) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
        this.userRepository = userRepository;
        this.emailSenderService = emailSenderService;
    }

    @Override
    public OrderResponse createOrder(String customerEmail, CreateOrderRequest request) {
        User user = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + customerEmail));

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item");
        }

        Order order = new Order();
        order.setUser(user);
        String orderNumber = "ORD-" + System.currentTimeMillis() + "-" + (int) (100 + Math.random() * 900);
        order.setOrderNumber(orderNumber);
        order.setShippingAddress(request.getShippingAddress() != null ? request.getShippingAddress().trim() : "Default Address");
        order.setStatus(OrderStatus.CONFIRMED);

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + itemReq.getProductId()));

            if (!product.isActive()) {
                throw new IllegalArgumentException("Product '" + product.getName() + "' is currently inactive/unavailable");
            }

            // Inventory check & deduction
            Optional<Inventory> optInv = inventoryRepository.findByProductId(product.getId());
            if (optInv.isPresent()) {
                Inventory inv = optInv.get();
                if (inv.getQuantity() < itemReq.getQuantity()) {
                    throw new IllegalArgumentException("Insufficient inventory for '" + product.getName() + "'. Available: " + inv.getQuantity() + ", requested: " + itemReq.getQuantity());
                }
                inv.setQuantity(inv.getQuantity() - itemReq.getQuantity());
                inventoryRepository.save(inv);
            }

            BigDecimal price = product.getPrice();
            BigDecimal subtotal = price.multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            totalAmount = totalAmount.add(subtotal);

            OrderItem orderItem = new OrderItem(order, product, product.getName(), itemReq.getQuantity(), price, subtotal);
            order.addItem(orderItem);
        }

        order.setTotalAmount(totalAmount);

        // Payment creation
        PaymentMethod method;
        try {
            method = PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase());
        } catch (Exception e) {
            method = PaymentMethod.CARD;
        }

        String txnId = "TXN-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
        Payment payment = new Payment(order, method, PaymentStatus.COMPLETED, txnId, totalAmount, LocalDateTime.now());
        order.setPayment(payment);

        Order savedOrder = orderRepository.save(order);

        // Send Real-time Order Confirmation & Tracking Email
        try {
            emailSenderService.sendOrderConfirmationEmail(savedOrder);
        } catch (Exception e) {
            logger.warn("Failed to dispatch order confirmation email: {}", e.getMessage());
        }

        return mapToOrderResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getCustomerOrders(String customerEmail) {
        User user = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + customerEmail));

        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getCustomerOrderById(String customerEmail, Long orderId) {
        User user = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + customerEmail));

        Order order = orderRepository.findByIdAndUserId(orderId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + orderId));

        return mapToOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    private OrderResponse mapToOrderResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> new OrderItemResponse(
                        item.getId(),
                        item.getProduct() != null ? item.getProduct().getId() : null,
                        item.getProductName(),
                        item.getQuantity(),
                        item.getPrice(),
                        item.getSubtotal()
                ))
                .collect(Collectors.toList());

        PaymentResponse paymentResponse = null;
        if (order.getPayment() != null) {
            paymentResponse = new PaymentResponse(
                    order.getPayment().getId(),
                    order.getPayment().getPaymentMethod().name(),
                    order.getPayment().getPaymentStatus().name(),
                    order.getPayment().getTransactionId(),
                    order.getPayment().getAmount(),
                    order.getPayment().getPaymentDate()
            );
        }

        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getUser().getId(),
                order.getUser().getEmail(),
                order.getTotalAmount(),
                order.getStatus().name(),
                order.getShippingAddress(),
                itemResponses,
                paymentResponse,
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }
}
