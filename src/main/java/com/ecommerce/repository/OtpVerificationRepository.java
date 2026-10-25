package com.ecommerce.repository;

import com.ecommerce.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {

    Optional<OtpVerification> findTopByIdentifierAndPurposeOrderByCreatedAtDesc(
            String identifier,
            String purpose
    );

    long countByIdentifierAndCreatedAtAfter(
            String identifier,
            LocalDateTime after
    );

    void deleteByIdentifier(String identifier);
}
