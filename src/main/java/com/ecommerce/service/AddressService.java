package com.ecommerce.service;

import com.ecommerce.dto.request.AddressRequest;
import com.ecommerce.dto.response.AddressResponse;
import com.ecommerce.dto.response.MessageResponse;

import java.util.List;

public interface AddressService {

    AddressResponse addAddress(
            String email,
            AddressRequest request
    );

    List<AddressResponse> getAddresses(
            String email
    );

    MessageResponse deleteAddress(
            String email,
            Long addressId
    );
    
    AddressResponse updateAddress(
            String email,
            Long addressId,
            AddressRequest request
    );
}
