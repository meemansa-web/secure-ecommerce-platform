package com.ecommerce.controller;

import com.ecommerce.dto.response.VendorResponse;
import com.ecommerce.service.VendorService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/vendors")
public class AdminVendorController {

    private final VendorService vendorService;

    public AdminVendorController(VendorService vendorService) {
        this.vendorService = vendorService;
    }

    @GetMapping("/pending")
    public ResponseEntity<List<VendorResponse>> getPendingVendors() {

        return ResponseEntity.ok(
                vendorService.getPendingVendors()
        );
    }

    @PutMapping("/{vendorId}/approve")
    public ResponseEntity<VendorResponse> approveVendor(
            @PathVariable Long vendorId
    ) {

        return ResponseEntity.ok(
                vendorService.approveVendor(vendorId)
        );
    }

    @PutMapping("/{vendorId}/reject")
    public ResponseEntity<VendorResponse> rejectVendor(
            @PathVariable Long vendorId
    ) {

        return ResponseEntity.ok(
                vendorService.rejectVendor(vendorId)
        );
    }
    @GetMapping
    public ResponseEntity<List<VendorResponse>> getAllVendors() {

        return ResponseEntity.ok(
                vendorService.getAllVendors()
        );
    }
    @GetMapping("/{vendorId}")
    public ResponseEntity<VendorResponse> getVendorById(
            @PathVariable Long vendorId
    ) {

        return ResponseEntity.ok(
                vendorService.getVendorById(vendorId)
        );
    }
}