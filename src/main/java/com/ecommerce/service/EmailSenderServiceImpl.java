package com.ecommerce.service;

import com.ecommerce.entity.Order;
import com.ecommerce.entity.OrderItem;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class EmailSenderServiceImpl implements EmailSenderService {

    private static final Logger logger = LoggerFactory.getLogger(EmailSenderServiceImpl.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${app.mail.from:noreply@nivora.com}")
    private String defaultFromEmail;

    @Value("${app.mail.from-name:Nivora}")
    private String defaultFromName;

    public EmailSenderServiceImpl(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    private boolean isMailConfigured() {
        return mailSender != null && mailUsername != null && !mailUsername.trim().isEmpty();
    }

    @Override
    public void sendOtpEmail(String recipientEmail, String otpCode) {
        if (!isMailConfigured()) {
            logger.warn("[EMAIL SENDER NOTICE] Real email sending skipped because SMTP is not configured. Configure 'spring.mail.username' and 'spring.mail.password'.");
            throw new IllegalStateException("Email service is temporarily unavailable. Please contact support.");
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String fromAddress = (mailUsername != null && !mailUsername.trim().isEmpty()) ? mailUsername : defaultFromEmail;
            helper.setFrom(new InternetAddress(fromAddress, defaultFromName));
            helper.setTo(recipientEmail);
            helper.setSubject("Your Nivora Sign-In Verification Code");

            String template = """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #0b0f19; margin: 0; padding: 20px 0; color: #f8fafc; }
                    .container { max-width: 580px; margin: 0 auto; background: #0f172a; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
                    .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 32px 24px; border-bottom: 2px solid #d4af37; text-align: center; }
                    .logo { margin: 0; font-size: 26px; color: #d4af37; letter-spacing: 3px; font-weight: 700; }
                    .tagline { margin: 6px 0 0; font-size: 11px; color: #94a3b8; letter-spacing: 1.5px; text-transform: uppercase; }
                    .content { padding: 36px 28px; }
                    .greeting { margin: 0 0 16px; font-size: 20px; color: #ffffff; font-weight: 600; }
                    .text { margin: 0 0 24px; font-size: 15px; color: #cbd5e1; line-height: 1.6; }
                    .otp-box { background: rgba(212, 175, 55, 0.08); border: 2px dashed #d4af37; border-radius: 12px; padding: 24px; text-align: center; margin: 0 auto 28px; max-width: 340px; }
                    .otp-code { font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #d4af37; font-family: monospace; }
                    .otp-exp { margin: 10px 0 0; font-size: 12px; color: #94a3b8; }
                    .security-card { background: rgba(255, 255, 255, 0.03); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.06); padding: 16px; font-size: 13px; color: #94a3b8; line-height: 1.5; margin-bottom: 20px; }
                    .security-title { color: #f1f5f9; font-weight: 600; margin-bottom: 6px; }
                    .footer { background: rgba(0, 0, 0, 0.3); padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.06); }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <div class="logo">NIVORA</div>
                      <div class="tagline">Authentication & Security Verification</div>
                    </div>
                    <div class="content">
                      <h2 class="greeting">Sign-In Verification Code</h2>
                      <p class="text">You recently requested to sign in to your Nivora account. Use the one-time verification code below to complete authentication:</p>
                      <div class="otp-box">
                        <div class="otp-code">{{OTP_CODE}}</div>
                        <p class="otp-exp">Valid for <strong>5 minutes</strong> only</p>
                      </div>
                      <div class="security-card">
                        <div class="security-title">Security Information:</div>
                        <div>• This code is for your eyes only. Never share your OTP with anyone.</div>
                        <div>• If you did not initiate this sign-in attempt, please secure your account immediately.</div>
                      </div>
                    </div>
                    <div class="footer">
                      <p style="margin: 0 0 6px 0;">This email was sent to {{RECIPIENT_EMAIL}} regarding your Nivora account.</p>
                      <p style="margin: 0;">&copy; Nivora E-Commerce Platform. All rights reserved.</p>
                    </div>
                  </div>
                </body>
                </html>
                """;

            String html = template
                    .replace("{{OTP_CODE}}", otpCode)
                    .replace("{{RECIPIENT_EMAIL}}", recipientEmail);

            helper.setText(html, true);
            mailSender.send(message);
            logger.info("[EMAIL SENDER] Successfully sent real live OTP email to {}", recipientEmail);

        } catch (Exception e) {
            logger.error("[EMAIL SENDER ERROR] Failed to send OTP email to {}: {}", recipientEmail, e.getMessage());
            throw new RuntimeException("Failed to dispatch verification email via Gmail SMTP: " + e.getMessage(), e);
        }
    }

    @Override
    @Async
    public void sendOrderConfirmationEmail(Order order) {
        if (order == null || order.getUser() == null || order.getUser().getEmail() == null) {
            return;
        }

        String recipientEmail = order.getUser().getEmail();
        String customerName = (order.getUser().getFirstname() != null ? order.getUser().getFirstname() : "Valued Member");

        if (!isMailConfigured()) {
            logger.warn("\n"
                    + "=========================================================================\n"
                    + "[ORDER EMAIL NOTICE] Real email skipped (SMTP credentials not configured).\n"
                    + "Order #{} for customer {} ({}) - Total: INR {}\n"
                    + "=========================================================================",
                    order.getOrderNumber(), customerName, recipientEmail, order.getTotalAmount()
            );
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String fromAddress = (mailUsername != null && !mailUsername.trim().isEmpty()) ? mailUsername : defaultFromEmail;
            helper.setFrom(new InternetAddress(fromAddress, defaultFromName));
            helper.setTo(recipientEmail);
            helper.setSubject("Order Confirmed! #" + order.getOrderNumber() + " — Nivora Order & Tracking");

            NumberFormat inrFormat = NumberFormat.getCurrencyInstance(new Locale("en", "IN"));
            String formattedTotal = inrFormat.format(order.getTotalAmount() != null ? order.getTotalAmount() : 0);

            StringBuilder itemsHtml = new StringBuilder();
            if (order.getItems() != null) {
                for (OrderItem item : order.getItems()) {
                    String itemTotal = inrFormat.format(item.getSubtotal() != null ? item.getSubtotal() : 0);
                    String itemPrice = inrFormat.format(item.getPrice() != null ? item.getPrice() : 0);
                    itemsHtml.append("""
                        <tr>
                          <td style="padding: 12px 8px; border-bottom: 1px solid rgba(255,255,255,0.06); color: #ffffff; font-weight: 600;">
                            %s <span style="font-size: 12px; color: #94a3b8; font-weight: 400;">&times; %d</span>
                          </td>
                          <td style="padding: 12px 8px; border-bottom: 1px solid rgba(255,255,255,0.06); text-align: right; color: #94a3b8;">
                            %s
                          </td>
                          <td style="padding: 12px 8px; border-bottom: 1px solid rgba(255,255,255,0.06); text-align: right; color: #d4af37; font-weight: 700;">
                            %s
                          </td>
                        </tr>
                    """.formatted(item.getProductName(), item.getQuantity(), itemPrice, itemTotal));
                }
            }

            String dateStr = order.getCreatedAt() != null
                    ? order.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"))
                    : "Recent";

            String paymentMethod = (order.getPayment() != null && order.getPayment().getPaymentMethod() != null)
                    ? order.getPayment().getPaymentMethod().name()
                    : "Online";

            String template = """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #0b0f19; margin: 0; padding: 20px 0; color: #f8fafc; }
                    .container { max-width: 620px; margin: 0 auto; background: #0f172a; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
                    .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 30px 24px; border-bottom: 2px solid #d4af37; text-align: center; }
                    .logo { margin: 0; font-size: 26px; color: #d4af37; letter-spacing: 2px; font-weight: 700; }
                    .tagline { margin: 6px 0 0; font-size: 11px; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase; }
                    .content { padding: 32px 24px; }
                    .badge { background: rgba(34, 197, 94, 0.12); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 8px; padding: 16px; margin-bottom: 24px; text-align: center; }
                    .badge-title { margin: 0 0 4px; font-size: 18px; color: #4ade80; font-weight: 700; }
                    .badge-sub { margin: 0; font-size: 13px; color: #cbd5e1; }
                    .table { width: 100%; border-collapse: collapse; font-size: 14px; margin: 16px 0 24px; }
                    .table-head { background: rgba(255,255,255,0.04); color: #94a3b8; text-transform: uppercase; font-size: 11px; }
                    .table-head th { padding: 10px 8px; text-align: left; }
                    .footer { background: rgba(0, 0, 0, 0.3); padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.06); }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <div class="logo">NIVORA</div>
                      <div class="tagline">Order Confirmation & Tracking Information</div>
                    </div>
                    <div class="content">
                      <div class="badge">
                        <div class="badge-title">&check; Order Confirmed Successfully</div>
                        <div class="badge-sub">Order Number: <strong>#{{ORDER_NUMBER}}</strong> &bull; Placed on {{ORDER_DATE}}</div>
                      </div>

                      <p style="margin: 0 0 20px; font-size: 15px; color: #cbd5e1; line-height: 1.6;">
                        Dear <strong>{{CUSTOMER_NAME}}</strong>, thank you for your order! Your purchase is confirmed and is being packaged by our artisans with utmost care.
                      </p>

                      <table class="table">
                        <thead class="table-head">
                          <tr>
                            <th>Item</th>
                            <th style="text-align: right;">Unit Price</th>
                            <th style="text-align: right;">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {{ITEMS_HTML}}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colspan="2" style="padding: 14px 8px 6px; text-align: right; font-size: 15px; font-weight: 700; color: #ffffff;">Total Amount Paid:</td>
                            <td style="padding: 14px 8px 6px; text-align: right; font-size: 17px; font-weight: 800; color: #d4af37;">{{TOTAL_AMOUNT}}</td>
                          </tr>
                        </tfoot>
                      </table>

                      <div style="background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); padding: 16px; margin-bottom: 24px;">
                        <div style="font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; margin-bottom: 4px;">Delivery Destination</div>
                        <div style="font-size: 14px; color: #ffffff; line-height: 1.5;">{{SHIPPING_ADDRESS}}</div>
                        <div style="margin-top: 12px; font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; margin-bottom: 4px;">Payment Method</div>
                        <div style="font-size: 14px; color: #4ade80; font-weight: 600;">{{PAYMENT_METHOD}} &bull; Verified</div>
                      </div>

                      <div style="text-align: center; margin: 28px 0 10px;">
                        <a href="http://localhost:5173/customer/orders" style="display: inline-block; background: #d4af37; color: #0b0f19; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 6px; text-decoration: none; text-transform: uppercase; letter-spacing: 1px;">
                          Track Your Order Online
                        </a>
                      </div>
                    </div>
                    <div class="footer">
                      <p style="margin: 0 0 6px 0;">Sent to {{RECIPIENT_EMAIL}} for Order #{{ORDER_NUMBER}}.</p>
                      <p style="margin: 0;">&copy; Nivora E-Commerce Platform. All rights reserved.</p>
                    </div>
                  </div>
                </body>
                </html>
                """;

            String html = template
                    .replace("{{ORDER_NUMBER}}", order.getOrderNumber())
                    .replace("{{ORDER_DATE}}", dateStr)
                    .replace("{{CUSTOMER_NAME}}", customerName)
                    .replace("{{ITEMS_HTML}}", itemsHtml.toString())
                    .replace("{{TOTAL_AMOUNT}}", formattedTotal)
                    .replace("{{SHIPPING_ADDRESS}}", order.getShippingAddress() != null ? order.getShippingAddress() : "Standard Address")
                    .replace("{{PAYMENT_METHOD}}", paymentMethod)
                    .replace("{{RECIPIENT_EMAIL}}", recipientEmail);

            helper.setText(html, true);
            mailSender.send(message);
            logger.info("[EMAIL SENDER] Successfully sent real order confirmation email for #{} to {}", order.getOrderNumber(), recipientEmail);

        } catch (Exception e) {
            logger.error("[EMAIL SENDER ERROR] Failed to send order confirmation email for #{}: {}", order.getOrderNumber(), e.getMessage(), e);
        }
    }

    @Override
    @Async
    public void sendWelcomeEmail(String recipientEmail, String username, String role) {
        if (!isMailConfigured()) {
            logger.warn("[WELCOME EMAIL NOTICE] Real email skipped (SMTP credentials not configured). Welcome email for {} ({})", username, recipientEmail);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String fromAddress = (mailUsername != null && !mailUsername.trim().isEmpty()) ? mailUsername : defaultFromEmail;
            helper.setFrom(new InternetAddress(fromAddress, defaultFromName));
            helper.setTo(recipientEmail);
            helper.setSubject("Welcome to Nivora! Your " + role.toLowerCase() + " profile is ready 🎉");

            String template = """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #0b0f19; margin: 0; padding: 20px 0; color: #f8fafc; }
                    .container { max-width: 580px; margin: 0 auto; background: #0f172a; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
                    .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 30px 24px; border-bottom: 2px solid #d4af37; text-align: center; }
                    .logo { margin: 0; font-size: 26px; color: #d4af37; letter-spacing: 2px; font-weight: 700; }
                    .content { padding: 36px 28px; }
                    .greeting { margin: 0 0 16px; font-size: 20px; color: #ffffff; }
                    .text { margin: 0 0 24px; font-size: 15px; color: #cbd5e1; line-height: 1.6; }
                    .footer { background: rgba(0, 0, 0, 0.3); padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.06); }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <div class="logo">NIVORA</div>
                    </div>
                    <div class="content">
                      <h2 class="greeting">Namaste, {{USERNAME}}!</h2>
                      <p class="text">Thank you for joining Nivora. Your <strong>{{ROLE}}</strong> account is now registered and active.</p>
                      <p class="text">You can sign in securely using your registered email (<strong>{{RECIPIENT_EMAIL}}</strong>) with either your password or a one-time verification OTP code.</p>
                      <div style="text-align: center; margin: 28px 0;">
                        <a href="http://localhost:5173/login" style="display: inline-block; background: #d4af37; color: #0b0f19; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 6px; text-decoration: none; text-transform: uppercase;">
                          Sign In to Nivora
                        </a>
                      </div>
                    </div>
                    <div class="footer">
                      <p style="margin: 0;">&copy; Nivora E-Commerce Platform. All rights reserved.</p>
                    </div>
                  </div>
                </body>
                </html>
                """;

            String html = template
                    .replace("{{USERNAME}}", username != null ? username : "Valued Member")
                    .replace("{{ROLE}}", role != null ? role : "CUSTOMER")
                    .replace("{{RECIPIENT_EMAIL}}", recipientEmail);

            helper.setText(html, true);
            mailSender.send(message);
            logger.info("[EMAIL SENDER] Successfully sent welcome email to {}", recipientEmail);

        } catch (Exception e) {
            logger.error("[EMAIL SENDER ERROR] Failed to send welcome email to {}: {}", recipientEmail, e.getMessage(), e);
        }
    }
}
