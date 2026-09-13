package com.ecommerce.controller;

import com.ecommerce.dto.request.ChangePasswordRequest;
import com.ecommerce.dto.request.UpdateAdminProfileRequest;
import com.ecommerce.dto.response.AdminProfileResponse;
import com.ecommerce.service.AdminService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.ecommerce.dto.response.CustomerAdminResponse;
import com.ecommerce.dto.response.MessageResponse;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/profile")
    public ResponseEntity<AdminProfileResponse> getProfile(
            Authentication authentication
    ) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                adminService.getAdminProfile(email)
        );
    }
    @GetMapping("/customers")
    public ResponseEntity<List<CustomerAdminResponse>> getAllCustomers() {

        return ResponseEntity.ok(
                adminService.getAllCustomers()
        );
    }
    @GetMapping("/customers/{customerId}")
    public ResponseEntity<CustomerAdminResponse> getCustomerById(
            @PathVariable Long customerId
    ) {

        return ResponseEntity.ok(
                adminService.getCustomerById(customerId)
        );
    }
    @PutMapping("/customers/{customerId}/disable")
    public ResponseEntity<CustomerAdminResponse> disableCustomer(
            @PathVariable Long customerId
    ) {

        return ResponseEntity.ok(
                adminService.disableCustomer(customerId)
        );
    }
    @PutMapping("/customers/{customerId}/enable")
    public ResponseEntity<CustomerAdminResponse> enableCustomer(
            @PathVariable Long customerId
    ) {

        return ResponseEntity.ok(
                adminService.enableCustomer(customerId)
        );
    }
    @PutMapping("/profile")
    public ResponseEntity<AdminProfileResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateAdminProfileRequest request
    ) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                adminService.updateAdminProfile(email, request)
        );
    }
    @PutMapping("/change-password")
    public ResponseEntity<MessageResponse> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request
    ) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                adminService.changePassword(email, request)
        );
    }
}