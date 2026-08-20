package com.ecommerce.entity;

import java.time.LocalDateTime;

import com.ecommerce.enums.Role;

import jakarta.annotation.Generated;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
		name ="users",
		uniqueConstraints = {
				@UniqueConstraint(columnNames = "email"),
				@UniqueConstraint(columnNames = "username")
		}
)
public class User {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
	
	@Column(nullable = false,unique = true,length = 50)
    private String username;
	
	@Column(nullable = false,unique = true,length = 100)
    private String email;
	
	@Column(nullable = false)
    private String password;
	
	@Column(nullable = false,length = 50)
    private String firstname;
	
	@Column(nullable = false,length = 50)
    private String lastname;
	
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
    private Role role;
	
	@Column(nullable = false)
    private boolean enabled=true;
	
	@Column(nullable = false)
    private boolean accountLocaked=false;
	
	@Column(nullable = false)
    private int failedLoginAttmeps =0;
	
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    @PrePersist
    public void prePersist() {

        LocalDateTime now = LocalDateTime.now();

        this.createdAt = now;
        this.updatedAt = now;
    }
    
    @PreUpdate
    public void preUpdate() {
    	this.updatedAt=LocalDateTime.now();
    }
    
    public User() {
    	
    }
    
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getUsername() {
		return username;
	}
	public void setUsername(String username) {
		this.username = username;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public String getFirstname() {
		return firstname;
	}
	public void setFirstname(String firstname) {
		this.firstname = firstname;
	}
	public String getLastname() {
		return lastname;
	}
	public void setLastname(String lastname) {
		this.lastname = lastname;
	}
	public Role getRole() {
		return role;
	}
	public void setRole(Role role) {
		this.role = role;
	}
	public boolean isEnabled() {
		return enabled;
	}
	public void setEnabled(boolean enabled) {
		this.enabled = enabled;
	}
	public boolean isAccountLocaked() {
		return accountLocaked;
	}
	public void setAccountLocaked(boolean accountLocaked) {
		this.accountLocaked = accountLocaked;
	}
	public int getFailedLoginAttmeps() {
		return failedLoginAttmeps;
	}
	public void setFailedLoginAttmeps(int failedLoginAttmeps) {
		this.failedLoginAttmeps = failedLoginAttmeps;
	}
	public LocalDateTime getCreatedAt() {
		return createdAt;
	}
	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}
	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}
    
	
}
