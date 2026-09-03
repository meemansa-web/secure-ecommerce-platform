package com.ecommerce.service;

import com.ecommerce.dto.response.UserResponse;
import com.ecommerce.entity.User;
import com.ecommerce.repository.UserRepository;

import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;


    public UserServiceImpl(
            UserRepository userRepository
    ) {
        this.userRepository = userRepository;
    }


    @Override
    public UserResponse getUserById(Long id) {

        User user = userRepository
                .findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "User not found"
                        )
                );

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstname(),
                user.getLastname(),
                user.getRole()
        );
    }
}