package com.ecommerce.service;

import com.ecommerce.dto.request.SendOtpRequest;
import com.ecommerce.dto.request.VerifyOtpLoginRequest;
import com.ecommerce.dto.response.AuthResponse;
import com.ecommerce.dto.response.OtpResponse;

public interface OtpService {

    OtpResponse sendLoginOtp(SendOtpRequest request);

    AuthResponse verifyOtpAndLogin(VerifyOtpLoginRequest request);
}
