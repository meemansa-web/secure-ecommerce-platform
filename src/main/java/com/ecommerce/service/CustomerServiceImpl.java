package com.ecommerce.service;

import com.ecommerce.dto.request.ChangePasswordRequest;
import com.ecommerce.dto.request.UpdateCustomerProfileRequest;
import com.ecommerce.dto.response.CustomerProfileResponse;
import com.ecommerce.dto.response.MessageResponse;
import com.ecommerce.entity.User;
import com.ecommerce.exception.ResourceAlreadyExistsException;
import com.ecommerce.exception.UserNotFoundException;
import com.ecommerce.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class CustomerServiceImpl implements CustomerService {
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public CustomerServiceImpl(
	        UserRepository userRepository,
	        PasswordEncoder passwordEncoder
	) {
	    this.userRepository = userRepository;
	    this.passwordEncoder = passwordEncoder;
	}

    @Override
    public CustomerProfileResponse getCurrentCustomer(String email) {

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException("Customer not found")
                );

        return new CustomerProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstname(),
                user.getLastname(),
                user.getRole()
        );
    }

    @Override
    public CustomerProfileResponse updateProfile(
            String email,
            UpdateCustomerProfileRequest request
    ) {

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException("Customer not found")
                );

        String newUsername = request.getUsername().trim();

        if (!user.getUsername().equals(newUsername)
                && userRepository.existsByUsername(newUsername)) {

            throw new ResourceAlreadyExistsException(
                    "Username is already taken"
            );
        }

        user.setFirstname(request.getFirstName().trim());
        user.setLastname(request.getLastName().trim());
        user.setUsername(newUsername);

        User updatedUser = userRepository.save(user);

        return new CustomerProfileResponse(
                updatedUser.getId(),
                updatedUser.getUsername(),
                updatedUser.getEmail(),
                updatedUser.getFirstname(),
                updatedUser.getLastname(),
                updatedUser.getRole()
        );
    }

    @Override
    public MessageResponse changePassword(
            String email,
            ChangePasswordRequest request
    ) {

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException("Customer not found")
                );

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