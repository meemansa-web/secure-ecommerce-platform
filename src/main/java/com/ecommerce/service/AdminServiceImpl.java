package com.ecommerce.service;

import com.ecommerce.dto.request.ChangePasswordRequest;
import com.ecommerce.dto.request.UpdateAdminProfileRequest;
import com.ecommerce.dto.response.AdminProfileResponse;
import com.ecommerce.dto.response.CustomerAdminResponse;
import com.ecommerce.dto.response.MessageResponse;
import com.ecommerce.entity.User;
import com.ecommerce.enums.Role;
import com.ecommerce.exception.ResourceAlreadyExistsException;
import com.ecommerce.exception.UserNotFoundException;
import com.ecommerce.repository.UserRepository;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    private CustomerAdminResponse mapToCustomerResponse(User user) {

        return new CustomerAdminResponse(
                user.getId(),
                user.getFirstname(),
                user.getLastname(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                user.isEnabled()
        );
    }

    public AdminServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public AdminProfileResponse getAdminProfile(String email) {

        User user = userRepository
                .findByEmail(email.toLowerCase())
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "Admin user not found"
                        )
                );

        if (user.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException(
                    "User is not an admin"
            );
        }

        return new AdminProfileResponse(
                user.getId(),
                user.getFirstname(),
                user.getLastname(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name()
        );
    }
    
    @Override
    public List<CustomerAdminResponse> getAllCustomers() {

        List<User> customers =
                userRepository.findByRole(Role.CUSTOMER);

        return customers.stream()
                .map(user -> new CustomerAdminResponse(
                        user.getId(),
                        user.getFirstname(),
                        user.getLastname(),
                        user.getUsername(),
                        user.getEmail(),
                        user.getRole().name(),
                        user.isEnabled()
                ))
                .toList();
    }
    @Override
    public CustomerAdminResponse getCustomerById(Long customerId) {

        User user = userRepository.findById(customerId)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "Customer not found with id: " + customerId
                        )
                );

        if (user.getRole() != Role.CUSTOMER) {
            throw new IllegalArgumentException(
                    "User is not a customer"
            );
        }

        return new CustomerAdminResponse(
                user.getId(),
                user.getFirstname(),
                user.getLastname(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                user.isEnabled()
        );
    }
    
    @Override
    public CustomerAdminResponse disableCustomer(Long customerId) {

        User user = userRepository.findById(customerId)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "Customer not found with id: " + customerId
                        )
                );

        if (user.getRole() != Role.CUSTOMER) {
            throw new IllegalArgumentException(
                    "User is not a customer"
            );
        }

        if (!user.isEnabled()) {
            throw new IllegalArgumentException(
                    "Customer account is already disabled"
            );
        }

        user.setEnabled(false);

        userRepository.save(user);

        return mapToCustomerResponse(user);
    }
    
    @Override
    public CustomerAdminResponse enableCustomer(Long customerId) {

        User user = userRepository.findById(customerId)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "Customer not found with id: " + customerId
                        )
                );

        if (user.getRole() != Role.CUSTOMER) {
            throw new IllegalArgumentException(
                    "User is not a customer"
            );
        }

        if (user.isEnabled()) {
            throw new IllegalArgumentException(
                    "Customer account is already enabled"
            );
        }

        user.setEnabled(true);

        userRepository.save(user);

        return mapToCustomerResponse(user);
    }
    @Override
    public AdminProfileResponse updateAdminProfile(
            String email,
            UpdateAdminProfileRequest request
    ) {

        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() ->
                        new UserNotFoundException("Admin user not found")
                );

        if (user.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("User is not an admin");
        }

        String newUsername = request.getUsername().trim();

        if (!user.getUsername().equalsIgnoreCase(newUsername)
                && userRepository.existsByUsername(newUsername)) {

            throw new ResourceAlreadyExistsException(
                    "Username already exists"
            );
        }

        user.setFirstname(request.getFirstName().trim());
        user.setLastname(request.getLastName().trim());
        user.setUsername(newUsername);

        userRepository.save(user);

        return new AdminProfileResponse(
                user.getId(),
                user.getFirstname(),
                user.getLastname(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name()
        );
    }

    @Override
    public MessageResponse changePassword(
            String email,
            ChangePasswordRequest request
    ) {

        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() ->
                        new UserNotFoundException("Admin user not found")
                );

        if (user.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("User is not an admin");
        }

        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword()
        )) {
            throw new IllegalArgumentException(
                    "Current password is incorrect"
            );
        }

        if (!request.getNewPassword()
                .equals(request.getConfirmPassword())) {

            throw new IllegalArgumentException(
                    "New password and confirm password do not match"
            );
        }

        if (passwordEncoder.matches(
                request.getNewPassword(),
                user.getPassword()
        )) {
            throw new IllegalArgumentException(
                    "New password cannot be same as current password"
            );
        }

        user.setPassword(
                passwordEncoder.encode(request.getNewPassword())
        );

        userRepository.save(user);

        return new MessageResponse(
                "Password changed successfully"
        );
    }}
