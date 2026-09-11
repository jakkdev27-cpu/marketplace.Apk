package com.marketplace.repository;

import com.marketplace.entity.LegalConsent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LegalConsentRepository extends JpaRepository<LegalConsent, UUID> {
}
