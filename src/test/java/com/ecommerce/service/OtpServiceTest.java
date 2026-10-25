package com.ecommerce.service;

import com.ecommerce.dto.request.SendOtpRequest;
import com.ecommerce.dto.request.VerifyOtpLoginRequest;
import com.ecommerce.dto.response.AuthResponse;
import com.ecommerce.dto.response.OtpResponse;
import com.ecommerce.entity.OtpVerification;
import com.ecommerce.entity.User;
import com.ecommerce.enums.Role;
import com.ecommerce.exception.UserNotFoundException;
import com.ecommerce.repository.OtpVerificationRepository;
import com.ecommerce.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class OtpServiceTest {

    @Autowired
    private OtpService otpService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OtpVerificationRepository otpVerificationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;

    @BeforeEach
    void setUp() {
        String testEmail = "otptestuser@example.com";
        userRepository.findByEmail(testEmail).ifPresent(userRepository::delete);

        testUser = new User();
        testUser.setUsername("otptestuser");
        testUser.setEmail(testEmail);
        testUser.setPhoneNumber("9876543210");
        testUser.setFirstname("OTP");
        testUser.setLastname("Tester");
        testUser.setPassword(passwordEncoder.encode("Password123!"));
        testUser.setRole(Role.CUSTOMER);
        testUser.setEnabled(true);
        testUser.setAccountLocaked(false);
        testUser = userRepository.save(testUser);
    }

    @Test
    @DisplayName("Should successfully send OTP to existing email")
    void testSendOtpByEmailSuccess() {
        SendOtpRequest request = new SendOtpRequest("otptestuser@example.com", "LOGIN");
        OtpResponse response = otpService.sendLoginOtp(request);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals("EMAIL", response.getChannel());
        assertNotNull(response.getMaskedIdentifier());
    }

    @Test
    @DisplayName("Should successfully send OTP to existing phone number")
    void testSendOtpByPhoneSuccess() {
        SendOtpRequest request = new SendOtpRequest("9876543210", "LOGIN");
        OtpResponse response = otpService.sendLoginOtp(request);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals("SMS", response.getChannel());
        assertNotNull(response.getMaskedIdentifier());
    }

    @Test
    @DisplayName("Should throw UserNotFoundException if identifier does not exist")
    void testSendOtpUserNotFound() {
        SendOtpRequest request = new SendOtpRequest("nonexistentuser999@example.com", "LOGIN");
        assertThrows(UserNotFoundException.class, () -> otpService.sendLoginOtp(request));
    }

    @Test
    @DisplayName("Should verify valid OTP and return authenticated JWT response")
    void testVerifyOtpAndLoginSuccess() {
        SendOtpRequest sendReq = new SendOtpRequest("otptestuser@example.com", "LOGIN");
        otpService.sendLoginOtp(sendReq);

        OtpVerification otp = otpVerificationRepository
                .findTopByIdentifierAndPurposeOrderByCreatedAtDesc("otptestuser@example.com", "LOGIN")
                .orElse(null);
        assertNotNull(otp);

        VerifyOtpLoginRequest verifyReq = new VerifyOtpLoginRequest("otptestuser@example.com", otp.getOtpCode());
        AuthResponse authResponse = otpService.verifyOtpAndLogin(verifyReq);

        assertNotNull(authResponse);
        assertNotNull(authResponse.getAccessToken());
        assertEquals("Bearer", authResponse.getTokenType());
        assertEquals("otptestuser@example.com", authResponse.getEmail());
        assertEquals("CUSTOMER", authResponse.getRole());
    }

    @Test
    @DisplayName("Should reject invalid OTP code")
    void testVerifyOtpInvalidCode() {
        SendOtpRequest sendReq = new SendOtpRequest("otptestuser@example.com", "LOGIN");
        otpService.sendLoginOtp(sendReq);

        VerifyOtpLoginRequest verifyReq = new VerifyOtpLoginRequest("otptestuser@example.com", "000000");
        assertThrows(IllegalArgumentException.class, () -> otpService.verifyOtpAndLogin(verifyReq));
    }
}
