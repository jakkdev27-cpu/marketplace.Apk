package com.marketplace.legal;

import com.marketplace.entity.LegalDocument;
import com.marketplace.entity.LegalDocumentStatus;
import com.marketplace.entity.LegalDocumentType;
import com.marketplace.exception.ApiException;
import com.marketplace.repository.LegalDocumentRepository;
import com.marketplace.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LegalService {

    private final LegalDocumentRepository legalDocumentRepository;

    /** Dernière version publiée de chaque type de document. */
    @Transactional(readOnly = true)
    public List<LegalController.LegalDocumentResponse> published() {
        Map<LegalDocumentType, LegalDocument> latest = new LinkedHashMap<>();
        for (LegalDocument doc : legalDocumentRepository.findByStatusOrderByTypeAscVersionDesc(LegalDocumentStatus.PUBLISHED)) {
            latest.putIfAbsent(doc.getType(), doc);
        }
        return latest.values().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public LegalController.LegalDocumentResponse publishedByType(LegalDocumentType type) {
        LegalDocument doc = legalDocumentRepository.findTopByTypeAndStatusOrderByVersionDesc(type, LegalDocumentStatus.PUBLISHED)
                .orElseThrow(() -> ApiException.notFound("LEGAL_DOCUMENT_NOT_FOUND", "Document non disponible pour le moment"));
        return toResponse(doc);
    }

    @Transactional(readOnly = true)
    public List<LegalController.LegalDocumentResponse> allByType() {
        return legalDocumentRepository.findAll().stream()
                .sorted((a, b) -> {
                    int byType = a.getType().name().compareTo(b.getType().name());
                    return byType != 0 ? byType : Integer.compare(b.getVersion(), a.getVersion());
                })
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public LegalController.LegalDocumentResponse createDraft(LegalController.LegalDocumentRequest request, CurrentUser user) {
        int nextVersion = legalDocumentRepository.findTopByTypeOrderByVersionDesc(request.type())
                .map(doc -> doc.getVersion() + 1)
                .orElse(1);
        LegalDocument doc = new LegalDocument();
        doc.setType(request.type());
        doc.setTitle(request.title());
        doc.setContent(request.content());
        doc.setVersion(nextVersion);
        doc.setStatus(LegalDocumentStatus.DRAFT);
        doc.setCreatedBy(new com.marketplace.entity.User());
        doc.getCreatedBy().setId(user.id());
        doc.setChangeSummary(request.changeSummary());
        return toResponse(legalDocumentRepository.save(doc));
    }

    @Transactional
    public LegalController.LegalDocumentResponse publish(UUID id, CurrentUser user) {
        LegalDocument doc = legalDocumentRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("LEGAL_DOCUMENT_NOT_FOUND", "Document introuvable"));
        if (doc.getStatus() == LegalDocumentStatus.PUBLISHED) {
            throw new ApiException(HttpStatus.CONFLICT, "ALREADY_PUBLISHED", "Ce document est déjà publié");
        }
        doc.setStatus(LegalDocumentStatus.PUBLISHED);
        doc.setPublishedAt(Instant.now());
        doc.setEffectiveAt(Instant.now());
        doc.setUpdatedBy(new com.marketplace.entity.User());
        doc.getUpdatedBy().setId(user.id());
        return toResponse(legalDocumentRepository.save(doc));
    }

    @Transactional
    public LegalController.LegalDocumentResponse archive(UUID id, CurrentUser user) {
        LegalDocument doc = legalDocumentRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("LEGAL_DOCUMENT_NOT_FOUND", "Document introuvable"));
        doc.setStatus(LegalDocumentStatus.ARCHIVED);
        doc.setUpdatedBy(new com.marketplace.entity.User());
        doc.getUpdatedBy().setId(user.id());
        return toResponse(legalDocumentRepository.save(doc));
    }

    private LegalController.LegalDocumentResponse toResponse(LegalDocument doc) {
        return new LegalController.LegalDocumentResponse(
                doc.getId(),
                doc.getType().name(),
                doc.getTitle(),
                doc.getVersion(),
                doc.getContent(),
                doc.getStatus().name(),
                doc.getPublishedAt(),
                doc.getEffectiveAt(),
                doc.getChangeSummary());
    }
}
