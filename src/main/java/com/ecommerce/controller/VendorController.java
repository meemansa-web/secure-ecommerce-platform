package com.ecommerce.controller;

import com.ecommerce.dto.request.VendorRegistrationRequest;
import com.ecommerce.dto.response.VendorRegistrationResponse;
import com.ecommerce.service.VendorService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vendors")
public class VendorController {

    private final VendorService vendorService;

    public VendorController(
            VendorService vendorService
    ) {
        this.vendorService = vendorService;
    }

    @PostMapping("/register")
    public ResponseEntity<VendorRegistrationResponse> registerVendor(
            @Valid @RequestBody VendorRegistrationRequest request
    ) {

        VendorRegistrationResponse response =
                vendorService.registerVendor(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
}