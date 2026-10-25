package com.ecommerce.controller;

import com.ecommerce.entity.OtpVerification;
import com.ecommerce.entity.User;
import com.ecommerce.enums.Role;
import com.ecommerce.repository.OtpVerificationRepository;
import com.ecommerce.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Transactional
public class AuthControllerOtpTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OtpVerificationRepository otpVerificationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final String testEmail = "controller_otp_user@example.com";
    private final String testPhone = "9123456789";

    @BeforeEach
    void setup() {
        this.mockMvc = MockMvcBuilders
                .webAppContextSetup(webApplicationContext)
                .build();

        userRepository.findByEmail(testEmail).ifPresent(userRepository::delete);
        userRepository.findByPhoneNumber(testPhone).ifPresent(userRepository::delete);

        User user = new User();
        user.setUsername("controllerOtpUser");
        user.setEmail(testEmail);
        user.setPhoneNumber(testPhone);
        user.setFirstname("Integration");
        user.setLastname("User");
        user.setPassword(passwordEncoder.encode("Pass12345!"));
        user.setRole(Role.CUSTOMER);
        user.setEnabled(true);
        user.setAccountLocaked(false);
        userRepository.save(user);
    }

    @Test
    @DisplayName("POST /api/auth/otp/send - Successfully sends OTP to email without exposing OTP code in response")
    void testSendOtpApiEmail() throws Exception {
        String jsonPayload = """
                {
                    "identifier": "controller_otp_user@example.com",
                    "purpose": "LOGIN"
                }
                """;

        mockMvc.perform(post("/api/auth/otp/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.channel").value("EMAIL"))
                .andExpect(jsonPath("$.maskedIdentifier").isNotEmpty())
                .andExpect(jsonPath("$.devOtpCode").doesNotExist());
    }

    @Test
    @DisplayName("POST /api/auth/otp/send - Successfully sends OTP to mobile number without exposing code")
    void testSendOtpApiPhone() throws Exception {
        String jsonPayload = """
                {
                    "identifier": "9123456789",
                    "purpose": "LOGIN"
                }
                """;

        mockMvc.perform(post("/api/auth/otp/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.channel").value("SMS"))
                .andExpect(jsonPath("$.maskedIdentifier").isNotEmpty())
                .andExpect(jsonPath("$.devOtpCode").doesNotExist());
    }

    @Test
    @DisplayName("POST /api/auth/otp/verify-login - Completes login and returns JWT")
    void testVerifyOtpLoginApiSuccess() throws Exception {
        // Step 1: Send OTP
        String sendJson = """
                {
                    "identifier": "controller_otp_user@example.com",
                    "purpose": "LOGIN"
                }
                """;

        mockMvc.perform(post("/api/auth/otp/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(sendJson))
                .andExpect(status().isOk());

        // Step 2: Fetch securely from DB (never from API response)
        OtpVerification otp = otpVerificationRepository
                .findTopByIdentifierAndPurposeOrderByCreatedAtDesc("controller_otp_user@example.com", "LOGIN")
                .orElse(null);
        assertNotNull(otp);

        // Step 3: Verify OTP
        String verifyJson = String.format("""
                {
                    "identifier": "controller_otp_user@example.com",
                    "otpCode": "%s"
                }
                """, otp.getOtpCode());

        mockMvc.perform(post("/api/auth/otp/verify-login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(verifyJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.email").value("controller_otp_user@example.com"))
                .andExpect(jsonPath("$.role").value("CUSTOMER"));
    }
}
