package com.ecommerce.service;

import com.ecommerce.dto.request.ChangePasswordRequest;
import com.ecommerce.dto.request.UpdateVendorProfileRequest;
import com.ecommerce.dto.request.VendorRegistrationRequest;
import com.ecommerce.dto.response.MessageResponse;
import com.ecommerce.dto.response.VendorProfileResponse;
import com.ecommerce.dto.response.VendorRegistrationResponse;
import com.ecommerce.dto.response.VendorResponse;

import java.util.List;

public interface VendorService {

    VendorRegistrationResponse registerVendor(
            VendorRegistrationRequest request
    );

    List<VendorResponse> getPendingVendors();

    VendorResponse approveVendor(Long vendorId);

    VendorResponse rejectVendor(Long vendorId);
    VendorProfileResponse getCurrentVendor(String email);
    VendorProfileResponse updateVendorProfile(
            String email,
            UpdateVendorProfileRequest request
    );
    MessageResponse changePassword(
            String email,
            ChangePasswordRequest request
    );
}