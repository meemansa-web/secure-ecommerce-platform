package com.ecommerce.service;

import com.ecommerce.dto.request.LoginRequest;
import com.ecommerce.dto.request.RegisterRequest;
import com.ecommerce.dto.response.AuthResponse;
import com.ecommerce.dto.response.RegisterResponse;
import com.ecommerce.entity.User;
import com.ecommerce.enums.Role;
import com.ecommerce.exception.ResourceAlreadyExistsException;
import com.ecommerce.exception.UserNotFoundException;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.security.CustomerUserDetailService;
import com.ecommerce.security.JwtService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final CustomerUserDetailService customUserDetailsService;
    private final EmailSenderService emailSenderService;


    public AuthServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            CustomerUserDetailService customUserDetailsService,
            EmailSenderService emailSenderService
    ) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.customUserDetailsService = customUserDetailsService;
        this.emailSenderService = emailSenderService;
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

            throw new ResourceAlreadyExistsException(
                    "Email is already registered"
            );
        }


        /*
         * Prevent duplicate username.
         */
        if (userRepository.existsByUsername(username)) {

            throw new ResourceAlreadyExistsException(
                    "Username is already taken"
            );
        }

        /*
         * Handle optional phone number
         */
        String cleanPhone = null;
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty()) {
            cleanPhone = request.getPhoneNumber().replaceAll("[^0-9]", "");
            if (cleanPhone.length() == 12 && cleanPhone.startsWith("91")) {
                cleanPhone = cleanPhone.substring(2);
            }
            if (userRepository.existsByPhoneNumber(cleanPhone)) {
                throw new ResourceAlreadyExistsException(
                        "Mobile phone number is already registered"
                );
            }
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

        if (cleanPhone != null) {
            user.setPhoneNumber(cleanPhone);
        }


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

        // Dispatch Real-time Welcome Email
        try {
            emailSenderService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getUsername(), savedUser.getRole().name());
        } catch (Exception e) {
            logger.warn("Failed to dispatch welcome email: {}", e.getMessage());
        }

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
                                () -> new UserNotFoundException(
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
