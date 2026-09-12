package com.ecommerce.controller;

import com.ecommerce.dto.request.AddressRequest;
import com.ecommerce.dto.request.ChangePasswordRequest;
import com.ecommerce.dto.request.UpdateCustomerProfileRequest;
import com.ecommerce.dto.response.AddressResponse;
import com.ecommerce.dto.response.CustomerProfileResponse;
import com.ecommerce.dto.response.MessageResponse;
import com.ecommerce.service.AddressService;
import com.ecommerce.service.CustomerService;

import jakarta.validation.Valid;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    private final CustomerService customerService;
    private final AddressService addressService;

    

    public CustomerController(CustomerService customerService, AddressService addressService) {
		super();
		this.customerService = customerService;
		this.addressService = addressService;
	}
	@GetMapping("/profile")
    public ResponseEntity<CustomerProfileResponse> getProfile(
            Authentication authentication
    ) {

        String email = authentication.getName();

        CustomerProfileResponse response =
                customerService.getCurrentCustomer(email);

        return ResponseEntity.ok(response);
    }
    @PutMapping("/profile")
    public ResponseEntity<CustomerProfileResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateCustomerProfileRequest request
    ) {

        String email = authentication.getName();

        CustomerProfileResponse response =
                customerService.updateProfile(email, request);

        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/change-password")
    public ResponseEntity<MessageResponse> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request
    ) {

        String email = authentication.getName();

        MessageResponse response =
                customerService.changePassword(
                        email,
                        request
                );

        return ResponseEntity.ok(response);
    }
    @PostMapping("/addresses")
    public ResponseEntity<AddressResponse> addAddress(
            Authentication authentication,
            @Valid @RequestBody AddressRequest request
    ) {

        String email = authentication.getName();

        AddressResponse response =
                addressService.addAddress(email, request);

        return ResponseEntity
                .status(201)
                .body(response);
    }
    
    @GetMapping("/addresses")
    public ResponseEntity<List<AddressResponse>> getAddresses(
            Authentication authentication
    ) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                addressService.getAddresses(email)
        );
    }
    
    @PutMapping("/addresses/{id}")
    public ResponseEntity<AddressResponse> updateAddress(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest request
    ) {

        return ResponseEntity.ok(
                addressService.updateAddress(
                        authentication.getName(),
                        id,
                        request
                )
        );
    }
    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<MessageResponse> deleteAddress(
            Authentication authentication,
            @PathVariable Long id
    ) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                addressService.deleteAddress(email, id)
        );
    }
}