package com.ecommerce.service;

import java.util.List;

import com.ecommerce.dto.request.ChangePasswordRequest;
import com.ecommerce.dto.request.UpdateAdminProfileRequest;
import com.ecommerce.dto.response.AdminProfileResponse;
import com.ecommerce.dto.response.CustomerAdminResponse;
import com.ecommerce.dto.response.MessageResponse;

public interface AdminService {

    AdminProfileResponse getAdminProfile(String email);
    List<CustomerAdminResponse> getAllCustomers();
    CustomerAdminResponse getCustomerById(Long customerId);
    CustomerAdminResponse enableCustomer(Long customerId);
    CustomerAdminResponse disableCustomer(Long customerId);
    AdminProfileResponse updateAdminProfile(String email,
            UpdateAdminProfileRequest request
    );
    MessageResponse changePassword(
            String email,
            ChangePasswordRequest request
    );
}
