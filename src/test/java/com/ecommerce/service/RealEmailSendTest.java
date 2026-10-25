package com.ecommerce.service;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

@SpringBootTest
public class RealEmailSendTest {

    @Autowired
    private EmailSenderService emailSenderService;

    @Test
    @Disabled("Verified live SMTP delivery: uncomment only when manual verification is needed")
    @DisplayName("Test sending real live email to meemansa2405@gmail.com")
    void testSendRealEmail() {
        assertDoesNotThrow(() -> {
            emailSenderService.sendOtpEmail("meemansa2405@gmail.com", "789456");
        });
    }
}
