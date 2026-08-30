package com.ecommerce.service;

import com.ecommerce.dto.request.LoginRequest;
import com.ecommerce.dto.request.RegisterRequest;
import com.ecommerce.dto.response.AuthResponse;
import com.ecommerce.dto.response.RegisterResponse;
import com.ecommerce.entity.User;
import com.ecommerce.enums.Role;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.security.CustomerUserDetailService;
import com.ecommerce.security.JwtService;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final CustomerUserDetailService customUserDetailsService;


    public AuthServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            CustomerUserDetailService customUserDetailsService
    ) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.customUserDetailsService = customUserDetailsService;
    }


    @Override
    public RegisterResponse register(RegisterRequest request) {

        /*
         * Normalize values before saving.
         */
        String email = request
                .getEmail()
                .trim()
                .toLowerCase();

        String username = request
                .getUsername()
                .trim();


        /*
         * Prevent duplicate email.
         */
        if (userRepository.existsByEmail(email)) {

            throw new RuntimeException(
                    "Email is already registered"
            );
        }


        /*
         * Prevent duplicate username.
         */
        if (userRepository.existsByUsername(username)) {

            throw new RuntimeException(
                    "Username is already taken"
            );
        }


        /*
         * Create new CUSTOMER.
         */
        User user = new User();

        user.setFirstname(
                request.getFirstName().trim()
        );

        user.setLastname(
                request.getLastName().trim()
        );

        user.setUsername(username);

        user.setEmail(email);


        /*
         * Never save plain-text passwords.
         */
        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );


        /*
         * Public registration can only create CUSTOMER.
         */
        user.setRole(Role.CUSTOMER);


        /*
         * Basic account-security defaults.
         */
        user.setEnabled(true);

        user.setAccountLocaked(false);

        user.setFailedLoginAttmeps(0);


        /*
         * createdAt and updatedAt are filled
         * by @PrePersist in User entity.
         */
        User savedUser =
                userRepository.save(user);


        return new RegisterResponse(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getRole().name(),
                "User registered successfully"
        );
    }


    @Override
    public AuthResponse login(LoginRequest request) {

        String email = request
                .getEmail()
                .trim()
                .toLowerCase();


        /*
         * Spring Security validates:
         * email + password
         */
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        email,
                        request.getPassword()
                )
        );


        /*
         * Fetch authenticated user.
         */
        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "User not found"
                                )
                        );


        /*
         * Convert our User into Spring Security UserDetails.
         */
        UserDetails userDetails =
                customUserDetailsService
                        .loadUserByUsername(email);


        /*
         * Generate JWT after successful login.
         */
        String accessToken =
                jwtService.generateToken(
                        userDetails
                );


        return new AuthResponse(
                accessToken,
                "Bearer",
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}