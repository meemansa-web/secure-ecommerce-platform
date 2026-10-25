package com.ecommerce.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class VerifyOtpLoginRequest {

    @NotBlank(message = "Email or mobile number is required")
    private String identifier;

    @NotBlank(message = "OTP verification code is required")
    @Pattern(regexp = "^\\d{6}$", message = "OTP must be a valid 6-digit code")
    private String otpCode;

    public VerifyOtpLoginRequest() {
    }

    public VerifyOtpLoginRequest(String identifier, String otpCode) {
        this.identifier = identifier;
        this.otpCode = otpCode;
    }

    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public String getOtpCode() {
        return otpCode;
    }

    public void setOtpCode(String otpCode) {
        this.otpCode = otpCode;
    }
}
