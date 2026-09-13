package com.ecommerce.repository;

import com.ecommerce.entity.Vendor;
import com.ecommerce.enums.VendorStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VendorRepository extends JpaRepository<Vendor, Long> {

    Optional<Vendor> findByUserId(Long userId);

    boolean existsByBusinessEmail(String businessEmail);

    List<Vendor> findByStatus(VendorStatus status);
}