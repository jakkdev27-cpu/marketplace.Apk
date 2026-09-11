package com.marketplace.repository;

import com.marketplace.entity.LegalDocument;
import com.marketplace.entity.LegalDocumentStatus;
import com.marketplace.entity.LegalDocumentType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LegalDocumentRepository extends JpaRepository<LegalDocument, UUID> {

    List<LegalDocument> findByStatusOrderByTypeAscVersionDesc(LegalDocumentStatus status);

    Optional<LegalDocument> findTopByTypeAndStatusOrderByVersionDesc(LegalDocumentType type, LegalDocumentStatus status);

    Optional<LegalDocument> findTopByTypeOrderByVersionDesc(LegalDocumentType type);

    List<LegalDocument> findByTypeOrderByVersionDesc(LegalDocumentType type);
}
