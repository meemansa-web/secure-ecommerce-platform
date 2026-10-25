package com.ecommerce.service;

import com.ecommerce.entity.Order;

public interface EmailSenderService {

    void sendOtpEmail(String recipientEmail, String otpCode);

    void sendOrderConfirmationEmail(Order order);

    void sendWelcomeEmail(String recipientEmail, String username, String role);
}
