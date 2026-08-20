package com.ecommerce.dto.response;

import com.ecommerce.enums.Role;

public class UserResponse {

    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;

    public UserResponse() {
    }

    public UserResponse(
            Long id,
            String username,
            String email,
            String firstName,
            String lastName,
            Role role) {

        this.id = id;
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public Role getRole() {
        return role;
    }
}