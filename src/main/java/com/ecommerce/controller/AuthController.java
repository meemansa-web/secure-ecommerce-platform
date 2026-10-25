package com.ecommerce.controller;

import com.ecommerce.dto.request.LoginRequest;
import com.ecommerce.dto.request.RegisterRequest;
import com.ecommerce.dto.request.SendOtpRequest;
import com.ecommerce.dto.request.VerifyOtpLoginRequest;
import com.ecommerce.dto.response.AuthResponse;
import com.ecommerce.dto.response.OtpResponse;
import com.ecommerce.dto.response.RegisterResponse;
import com.ecommerce.service.AuthService;
import com.ecommerce.service.OtpService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;

    public AuthController(AuthService authService, OtpService otpService) {
        this.authService = authService;
        this.otpService = otpService;
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        System.out.println("REGISTER API CALLED");
        RegisterResponse response = authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        return ResponseEntity.ok(
                authService.login(request)
        );
    }

    @PostMapping("/otp/send")
    public ResponseEntity<OtpResponse> sendOtp(
            @Valid @RequestBody SendOtpRequest request
    ) {
        return ResponseEntity.ok(
                otpService.sendLoginOtp(request)
        );
    }

    @PostMapping("/otp/verify-login")
    public ResponseEntity<AuthResponse> verifyOtpLogin(
            @Valid @RequestBody VerifyOtpLoginRequest request
    ) {
        return ResponseEntity.ok(
                otpService.verifyOtpAndLogin(request)
        );
    }
}
