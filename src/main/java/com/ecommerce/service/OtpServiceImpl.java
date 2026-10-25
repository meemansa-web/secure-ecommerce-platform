package com.ecommerce.service;

import com.ecommerce.dto.request.SendOtpRequest;
import com.ecommerce.dto.request.VerifyOtpLoginRequest;
import com.ecommerce.dto.response.AuthResponse;
import com.ecommerce.dto.response.OtpResponse;
import com.ecommerce.entity.OtpVerification;
import com.ecommerce.entity.User;
import com.ecommerce.exception.UserNotFoundException;
import com.ecommerce.repository.OtpVerificationRepository;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.security.CustomerUserDetailService;
import com.ecommerce.security.JwtService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class OtpServiceImpl implements OtpService {

    private static final Logger logger = LoggerFactory.getLogger(OtpServiceImpl.class);

    private final UserRepository userRepository;
    private final OtpVerificationRepository otpVerificationRepository;
    private final JwtService jwtService;
    private final CustomerUserDetailService customerUserDetailService;
    private final EmailSenderService emailSenderService;
    private final SecureRandom secureRandom = new SecureRandom();

    public OtpServiceImpl(
            UserRepository userRepository,
            OtpVerificationRepository otpVerificationRepository,
            JwtService jwtService,
            CustomerUserDetailService customerUserDetailService,
            EmailSenderService emailSenderService
    ) {
        this.userRepository = userRepository;
        this.otpVerificationRepository = otpVerificationRepository;
        this.jwtService = jwtService;
        this.customerUserDetailService = customerUserDetailService;
        this.emailSenderService = emailSenderService;
    }

    @Override
    @Transactional
    public OtpResponse sendLoginOtp(SendOtpRequest request) {
        String rawIdentifier = request.getIdentifier() != null ? request.getIdentifier().trim() : "";
        if (rawIdentifier.isEmpty()) {
            throw new IllegalArgumentException("Please enter a valid email address or mobile number");
        }

        boolean isEmail = rawIdentifier.contains("@");
        String channel = isEmail ? "EMAIL" : "SMS";
        String normalizedIdentifier = normalizeIdentifier(rawIdentifier, isEmail);

        // Find user by Email or Phone Number
        User user = findUserByIdentifier(rawIdentifier, normalizedIdentifier, isEmail);
        if (user == null) {
            String targetLabel = isEmail ? "email address (" + rawIdentifier + ")" : "phone number (" + rawIdentifier + ")";
            throw new UserNotFoundException("No account registered with this " + targetLabel + ". Please sign up first.");
        }

        if (user.isAccountLocaked()) {
            throw new IllegalArgumentException("This account has been locked due to security reasons. Please contact support.");
        }

        if (!user.isEnabled()) {
            throw new IllegalArgumentException("This account is currently disabled. Please contact customer support.");
        }

        // Resend cooldown verification (60 seconds)
        otpVerificationRepository
                .findTopByIdentifierAndPurposeOrderByCreatedAtDesc(normalizedIdentifier, "LOGIN")
                .ifPresent(existingOtp -> {
                    if (!existingOtp.isVerified() && existingOtp.getCreatedAt() != null) {
                        long secondsSince = java.time.Duration.between(existingOtp.getCreatedAt(), LocalDateTime.now()).getSeconds();
                        if (secondsSince < 60) {
                            long waitTime = 60 - secondsSince;
                            throw new IllegalArgumentException("Please wait " + waitTime + " seconds before requesting another verification code.");
                        }
                    }
                });

        // Generate cryptographically secure 6-digit OTP
        int randomPin = 100000 + secureRandom.nextInt(900000);
        String otpCode = String.valueOf(randomPin);
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(5);

        // Save OTP record
        OtpVerification otp = new OtpVerification(
                normalizedIdentifier,
                otpCode,
                expiryTime,
                request.getPurpose() != null ? request.getPurpose() : "LOGIN"
        );
        otpVerificationRepository.save(otp);

        String maskedIdentifier = maskIdentifier(rawIdentifier, isEmail);

        // Send Real Email if channel is EMAIL via Gmail SMTP
        if (isEmail && user.getEmail() != null) {
            try {
                emailSenderService.sendOtpEmail(user.getEmail(), otpCode);
            } catch (Exception e) {
                logger.error("Failed to trigger OTP email dispatch via SMTP: {}", e.getMessage());
                throw new IllegalArgumentException("Unable to deliver verification code to your email. Please try again later.");
            }
        }

        // Server-side audit logging without exposing sensitive OTP code
        logger.info("[OTP DISPATCH] Dispatched to {} ({}) for user {} (Role: {})",
                maskedIdentifier, channel, user.getUsername(), user.getRole()
        );

        String clientMessage = "A 6-digit verification code has been dispatched to your "
                + (isEmail ? "registered email address" : "mobile number")
                + " (" + maskedIdentifier + ").";

        return new OtpResponse(
                true,
                clientMessage,
                maskedIdentifier,
                channel,
                300
        );
    }

    @Override
    @Transactional
    public AuthResponse verifyOtpAndLogin(VerifyOtpLoginRequest request) {
        String rawIdentifier = request.getIdentifier() != null ? request.getIdentifier().trim() : "";
        String submittedCode = request.getOtpCode() != null ? request.getOtpCode().trim() : "";

        if (rawIdentifier.isEmpty()) {
            throw new IllegalArgumentException("Email address or phone number is required");
        }
        if (submittedCode.length() != 6 || !submittedCode.matches("\\d{6}")) {
            throw new IllegalArgumentException("Please enter a valid 6-digit verification code");
        }

        boolean isEmail = rawIdentifier.contains("@");
        String normalizedIdentifier = normalizeIdentifier(rawIdentifier, isEmail);

        User user = findUserByIdentifier(rawIdentifier, normalizedIdentifier, isEmail);
        if (user == null) {
            throw new UserNotFoundException("Account not found. Please register first.");
        }

        // Fetch latest OTP for this identifier
        OtpVerification otp = otpVerificationRepository
                .findTopByIdentifierAndPurposeOrderByCreatedAtDesc(normalizedIdentifier, "LOGIN")
                .orElseGet(() -> {
                    // Fallback to raw identifier check if normalized didn't match
                    return otpVerificationRepository
                            .findTopByIdentifierAndPurposeOrderByCreatedAtDesc(rawIdentifier, "LOGIN")
                            .orElse(null);
                });

        if (otp == null) {
            throw new IllegalArgumentException("No verification code was requested for this account. Please click 'Send OTP'.");
        }

        if (otp.isVerified()) {
            throw new IllegalArgumentException("This verification code has already been used. Please request a new code.");
        }

        if (otp.isExpired()) {
            throw new IllegalArgumentException("This verification code has expired. Please request a fresh OTP.");
        }

        if (otp.getAttempts() >= 5) {
            throw new IllegalArgumentException("Too many incorrect attempts. This code is invalidated. Please request a new OTP.");
        }

        // Validate code
        if (!otp.getOtpCode().equals(submittedCode)) {
            otp.setAttempts(otp.getAttempts() + 1);
            otpVerificationRepository.save(otp);
            int remaining = 5 - otp.getAttempts();
            throw new IllegalArgumentException("Invalid verification code. " + remaining + " attempts remaining.");
        }

        // Success - mark OTP verified
        otp.setVerified(true);
        otpVerificationRepository.save(otp);

        // Reset failed login attempts on user
        if (user.getFailedLoginAttmeps() > 0) {
            user.setFailedLoginAttmeps(0);
            userRepository.save(user);
        }

        // Generate JWT token
        UserDetails userDetails = customerUserDetailService.loadUserByUsername(user.getEmail());
        String accessToken = jwtService.generateToken(userDetails);

        logger.info("User '{}' successfully authenticated via OTP login ({})", user.getEmail(), isEmail ? "EMAIL" : "SMS");

        return new AuthResponse(
                accessToken,
                "Bearer",
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name()
        );
    }

    private String normalizeIdentifier(String identifier, boolean isEmail) {
        if (isEmail) {
            return identifier.trim().toLowerCase();
        }
        // Normalize phone number (strip whitespace, hyphens, and leading country code if appropriate)
        String digits = identifier.replaceAll("[^0-9]", "");
        if (digits.length() == 12 && digits.startsWith("91")) {
            return digits.substring(2); // Strip 91 prefix to standardize on 10 digits
        }
        return digits.length() >= 10 ? digits : identifier.trim();
    }

    private User findUserByIdentifier(String raw, String normalized, boolean isEmail) {
        if (isEmail) {
            return userRepository.findByEmailIgnoreCase(normalized)
                    .orElseGet(() -> userRepository.findByEmailIgnoreCase(raw).orElse(null));
        }

        // Search by phone number
        return userRepository.findByPhoneNumber(normalized)
                .orElseGet(() -> userRepository.findByPhoneNumber(raw)
                        .orElseGet(() -> userRepository.findByEmailOrPhoneNumber(raw).orElse(null)));
    }

    private String maskIdentifier(String identifier, boolean isEmail) {
        if (isEmail) {
            int atIndex = identifier.indexOf('@');
            if (atIndex <= 2) {
                return identifier;
            }
            String local = identifier.substring(0, atIndex);
            String domain = identifier.substring(atIndex);
            String maskedLocal = local.charAt(0) + "***" + local.charAt(local.length() - 1);
            return maskedLocal + domain;
        }

        String digits = identifier.replaceAll("[^0-9]", "");
        if (digits.length() >= 10) {
            String last4 = digits.substring(digits.length() - 4);
            return "+91 ******" + last4;
        }
        return identifier;
    }
}
