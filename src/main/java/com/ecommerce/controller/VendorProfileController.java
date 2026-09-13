package com.ecommerce.controller;

import com.ecommerce.dto.request.ChangePasswordRequest;
import com.ecommerce.dto.request.UpdateVendorProfileRequest;
import com.ecommerce.dto.response.MessageResponse;
import com.ecommerce.dto.response.VendorProfileResponse;
import com.ecommerce.service.VendorService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vendor")
public class VendorProfileController {

    private final VendorService vendorService;

    public VendorProfileController(
            VendorService vendorService
    ) {
        this.vendorService = vendorService;
    }

    @GetMapping("/profile")
    public ResponseEntity<VendorProfileResponse> getProfile(
            Authentication authentication
    ) {

        String email = authentication.getName();

        VendorProfileResponse response =
                vendorService.getCurrentVendor(email);

        return ResponseEntity.ok(response);
    }
    @PutMapping("/profile")
    public ResponseEntity<VendorProfileResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateVendorProfileRequest request
    ) {

        String email =
                authentication.getName();

        VendorProfileResponse response =
                vendorService.updateVendorProfile(
                        email,
                        request
                );

        return ResponseEntity.ok(response);
    }
    @PutMapping("/change-password")
    public ResponseEntity<MessageResponse> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request
    ) {

        String email = authentication.getName();

        MessageResponse response =
                vendorService.changePassword(
                        email,
                        request
                );

        return ResponseEntity.ok(response);
    }
}
