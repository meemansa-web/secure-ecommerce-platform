package com.ecommerce.service;

import com.ecommerce.dto.request.ChangePasswordRequest;
import com.ecommerce.dto.request.UpdateCustomerProfileRequest;
import com.ecommerce.dto.response.CustomerProfileResponse;
import com.ecommerce.dto.response.MessageResponse;

public interface CustomerService {

    CustomerProfileResponse getCurrentCustomer(String email);
    CustomerProfileResponse updateProfile(String email,UpdateCustomerProfileRequest request);
    MessageResponse changePassword( String email,ChangePasswordRequest request);
}