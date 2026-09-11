package com.marketplace.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "legal_documents", uniqueConstraints =
        @UniqueConstraint(columnNames = {"type", "version"}))
@Getter
@Setter
public class LegalDocument extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private LegalDocumentType type;

    @Column(nullable = false, length = 200)
    private String title;

    /** Numéro de version, unique par type. Toutes les versions sont conservées. */
    @Column(nullable = false)
    private int version;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LegalDocumentStatus status = LegalDocumentStatus.DRAFT;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "effective_at")
    private Instant effectiveAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    @Column(name = "change_summary", columnDefinition = "TEXT")
    private String changeSummary;
}
