package com.ecommerce.controller;

import com.ecommerce.dto.request.RegisterRequest;
import com.ecommerce.dto.response.UserResponse;
import com.ecommerce.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        UserResponse response =
                userService.registerCustomer(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
}
