package com.ecommerce.service;

import com.ecommerce.dto.request.CreateOrderRequest;
import com.ecommerce.dto.response.OrderResponse;

import java.util.List;

public interface OrderService {

    OrderResponse createOrder(String customerEmail, CreateOrderRequest request);

    List<OrderResponse> getCustomerOrders(String customerEmail);

    OrderResponse getCustomerOrderById(String customerEmail, Long orderId);

    List<OrderResponse> getAllOrders();
}
