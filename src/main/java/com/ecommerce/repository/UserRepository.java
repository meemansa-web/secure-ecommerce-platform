package com.ecommerce.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecommerce.entity.User;
import com.ecommerce.enums.Role;

public interface UserRepository extends JpaRepository<User, Long>{
	Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);
	
    List<User> findByRole(Role role);
}
