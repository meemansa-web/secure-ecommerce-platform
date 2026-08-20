package com.ecommerce.service;

import com.ecommerce.dto.request.RegisterRequest;
import com.ecommerce.dto.response.UserResponse;
import com.ecommerce.entity.User;
import com.ecommerce.enums.Role;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.service.UserService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserResponse registerCustomer(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken");
        }

        User user = new User();

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());

        user.setFirstname(request.getFirstName());
        user.setLastname(request.getLastName());

        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        user.setRole(Role.CUSTOMER);

        user.setEnabled(true);
        user.setAccountLocaked(false);
        user.setFailedLoginAttmeps(0);

        User savedUser = userRepository.save(user);

        return new UserResponse(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getFirstname(),
                savedUser.getLastname(),
                savedUser.getRole()
        );
    }
}