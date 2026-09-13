package com.ecommerce.service;

import com.ecommerce.dto.request.ChangePasswordRequest;
import com.ecommerce.dto.request.UpdateVendorProfileRequest;
import com.ecommerce.dto.request.VendorRegistrationRequest;
import com.ecommerce.dto.response.MessageResponse;
import com.ecommerce.dto.response.VendorProfileResponse;
import com.ecommerce.dto.response.VendorRegistrationResponse;
import com.ecommerce.dto.response.VendorResponse;
import com.ecommerce.entity.User;
import com.ecommerce.entity.Vendor;
import com.ecommerce.enums.Role;
import com.ecommerce.enums.VendorStatus;
import com.ecommerce.exception.ResourceAlreadyExistsException;
import com.ecommerce.exception.VendorNotFoundException;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.repository.VendorRepository;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class VendorServiceImpl implements VendorService {

    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final PasswordEncoder passwordEncoder;

    public VendorServiceImpl(
            UserRepository userRepository,
            VendorRepository vendorRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.vendorRepository = vendorRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public VendorRegistrationResponse registerVendor(
            VendorRegistrationRequest request
    ) {

        String email = request.getEmail()
                .trim()
                .toLowerCase();

        String username = request.getUsername()
                .trim();

        String businessEmail = request.getBusinessEmail()
                .trim()
                .toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new ResourceAlreadyExistsException(
                    "Email is already registered"
            );
        }

        if (userRepository.existsByUsername(username)) {
            throw new ResourceAlreadyExistsException(
                    "Username is already taken"
            );
        }

        if (vendorRepository.existsByBusinessEmail(businessEmail)) {
            throw new ResourceAlreadyExistsException(
                    "Business email is already registered"
            );
        }

        User user = new User();

        user.setFirstname(
                request.getFirstName().trim()
        );

        user.setLastname(
                request.getLastName().trim()
        );

        user.setUsername(username);

        user.setEmail(email);

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        user.setRole(Role.VENDOR);

        // Vendor cannot login until admin approval
        user.setEnabled(false);

        user.setAccountLocaked(false);
        user.setFailedLoginAttmeps(0);

        User savedUser =
                userRepository.save(user);

        Vendor vendor = new Vendor();

        vendor.setUser(savedUser);

        vendor.setBusinessName(
                request.getBusinessName().trim()
        );

        vendor.setBusinessEmail(
                businessEmail
        );

        vendor.setBusinessPhone(
                request.getBusinessPhone().trim()
        );

        vendor.setBusinessAddress(
                request.getBusinessAddress().trim()
        );

        vendor.setStatus(
                VendorStatus.PENDING
        );

        Vendor savedVendor =
                vendorRepository.save(vendor);

        return new VendorRegistrationResponse(
                savedVendor.getId(),
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedVendor.getBusinessName(),
                savedVendor.getStatus().name(),
                "Vendor registration submitted for approval"
        );
    }

    @Override
    public List<VendorResponse> getPendingVendors() {

        return vendorRepository
                .findByStatus(
                        VendorStatus.PENDING
                )
                .stream()
                .map(this::mapToVendorResponse)
                .toList();
    }

    @Override
    public VendorResponse approveVendor(Long vendorId) {

        Vendor vendor = vendorRepository
                .findById(vendorId)
                .orElseThrow(() ->
                        new VendorNotFoundException(
                                "Vendor not found with id: " + vendorId
                        )
                );

        if (vendor.getStatus() == VendorStatus.APPROVED) {
            throw new IllegalArgumentException(
                    "Vendor is already approved"
            );
        }

        if (vendor.getStatus() == VendorStatus.REJECTED) {
            throw new IllegalArgumentException(
                    "Rejected vendor cannot be approved directly"
            );
        }

        vendor.setStatus(
                VendorStatus.APPROVED
        );

        User user = vendor.getUser();

        user.setEnabled(true);

        userRepository.save(user);

        Vendor updatedVendor =
                vendorRepository.save(vendor);

        return mapToVendorResponse(
                updatedVendor
        );
    }

    @Override
    public VendorResponse rejectVendor(Long vendorId) {

        Vendor vendor = vendorRepository
                .findById(vendorId)
                .orElseThrow(() ->
                        new VendorNotFoundException(
                                "Vendor not found with id: " + vendorId
                        )
                );

        if (vendor.getStatus() == VendorStatus.REJECTED) {
            throw new IllegalArgumentException(
                    "Vendor is already rejected"
            );
        }

        if (vendor.getStatus() == VendorStatus.APPROVED) {
            throw new IllegalArgumentException(
                    "Approved vendor cannot be rejected directly"
            );
        }

        vendor.setStatus(
                VendorStatus.REJECTED
        );

        User user = vendor.getUser();

        user.setEnabled(false);

        userRepository.save(user);

        Vendor updatedVendor =
                vendorRepository.save(vendor);

        return mapToVendorResponse(
                updatedVendor
        );
    }

    private VendorResponse mapToVendorResponse(
            Vendor vendor
    ) {

        User user = vendor.getUser();

        return new VendorResponse(
                vendor.getId(),
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                vendor.getBusinessName(),
                vendor.getBusinessEmail(),
                vendor.getBusinessPhone(),
                vendor.getBusinessAddress(),
                vendor.getStatus().name()
        );
    }
    @Override
    public VendorProfileResponse getCurrentVendor(String email) {

        User user = userRepository
                .findByEmail(email.toLowerCase())
                .orElseThrow(() ->
                        new VendorNotFoundException(
                                "Vendor user not found"
                        )
                );

        Vendor vendor = vendorRepository
                .findByUserId(user.getId())
                .orElseThrow(() ->
                        new VendorNotFoundException(
                                "Vendor profile not found"
                        )
                );

        if (vendor.getStatus() != VendorStatus.APPROVED) {
            throw new IllegalArgumentException(
                    "Vendor account is not approved"
            );
        }

        return new VendorProfileResponse(
                vendor.getId(),
                user.getId(),
                user.getFirstname(),
                user.getLastname(),
                user.getUsername(),
                user.getEmail(),
                vendor.getBusinessName(),
                vendor.getBusinessEmail(),
                vendor.getBusinessPhone(),
                vendor.getBusinessAddress(),
                vendor.getStatus().name()
        );
    }
    @Override
    public VendorProfileResponse updateVendorProfile(
            String email,
            UpdateVendorProfileRequest request
    ) {

        User user = userRepository
                .findByEmail(email.toLowerCase())
                .orElseThrow(() ->
                        new VendorNotFoundException(
                                "Vendor user not found"
                        )
                );

        Vendor vendor = vendorRepository
                .findByUserId(user.getId())
                .orElseThrow(() ->
                        new VendorNotFoundException(
                                "Vendor profile not found"
                        )
                );

        if (vendor.getStatus() != VendorStatus.APPROVED) {
            throw new IllegalArgumentException(
                    "Vendor account is not approved"
            );
        }

        String newUsername =
                request.getUsername().trim();

        String newBusinessEmail =
                request.getBusinessEmail()
                        .trim()
                        .toLowerCase();

        // Check username only if it is changed
        if (!user.getUsername().equals(newUsername)
                && userRepository.existsByUsername(newUsername)) {

            throw new ResourceAlreadyExistsException(
                    "Username is already taken"
            );
        }

        // Check business email only if it is changed
        if (!vendor.getBusinessEmail().equalsIgnoreCase(newBusinessEmail)
                && vendorRepository.existsByBusinessEmail(newBusinessEmail)) {

            throw new ResourceAlreadyExistsException(
                    "Business email is already registered"
            );
        }

        user.setFirstname(
                request.getFirstName().trim()
        );

        user.setLastname(
                request.getLastName().trim()
        );

        user.setUsername(
                newUsername
        );

        vendor.setBusinessName(
                request.getBusinessName().trim()
        );

        vendor.setBusinessEmail(
                newBusinessEmail
        );

        vendor.setBusinessPhone(
                request.getBusinessPhone().trim()
        );

        vendor.setBusinessAddress(
                request.getBusinessAddress().trim()
        );

        userRepository.save(user);
        Vendor updatedVendor =
                vendorRepository.save(vendor);

        return new VendorProfileResponse(
                updatedVendor.getId(),
                user.getId(),
                user.getFirstname(),
                user.getLastname(),
                user.getUsername(),
                user.getEmail(),
                updatedVendor.getBusinessName(),
                updatedVendor.getBusinessEmail(),
                updatedVendor.getBusinessPhone(),
                updatedVendor.getBusinessAddress(),
                updatedVendor.getStatus().name()
        );
    }
        @Override
        public MessageResponse changePassword(
                String email,
                ChangePasswordRequest request
        ) {

            User user = userRepository
                    .findByEmail(email.toLowerCase())
                    .orElseThrow(() ->
                            new VendorNotFoundException(
                                    "Vendor user not found"
                            )
                    );

            Vendor vendor = vendorRepository
                    .findByUserId(user.getId())
                    .orElseThrow(() ->
                            new VendorNotFoundException(
                                    "Vendor profile not found"
                            )
                    );

            if (vendor.getStatus() != VendorStatus.APPROVED) {
                throw new IllegalArgumentException(
                        "Vendor account is not approved"
                );
            }

            // Check current password
            if (!passwordEncoder.matches(
                    request.getCurrentPassword(),
                    user.getPassword()
            )) {
                throw new IllegalArgumentException(
                        "Current password is incorrect"
                );
            }

            // Check new password and confirm password
            if (!request.getNewPassword().equals(
                    request.getConfirmPassword()
            )) {
                throw new IllegalArgumentException(
                        "New password and confirm password do not match"
                );
            }

            // New password should not be same as current password
            if (passwordEncoder.matches(
                    request.getNewPassword(),
                    user.getPassword()
            )) {
                throw new IllegalArgumentException(
                        "New password cannot be same as current password"
                );
            }

            user.setPassword(
                    passwordEncoder.encode(
                            request.getNewPassword()
                    )
            );

            userRepository.save(user);

            return new MessageResponse(
                    "Password changed successfully"
            );
    }
    
}