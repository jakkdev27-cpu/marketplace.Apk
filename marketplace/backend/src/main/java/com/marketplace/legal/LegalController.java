package com.marketplace.legal;

import com.marketplace.entity.LegalDocumentType;
import com.marketplace.security.CurrentUser;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class LegalController {

    private final LegalService legalService;

    public record LegalDocumentRequest(
            @NotNull LegalDocumentType type,
            @NotBlank @Size(max = 200) String title,
            @NotBlank String content,
            String changeSummary) {
    }

    public record LegalDocumentResponse(
            UUID id,
            String type,
            String title,
            int version,
            String content,
            String status,
            Instant publishedAt,
            Instant effectiveAt,
            String changeSummary) {
    }

    @GetMapping("/api/v1/legal/published")
    public List<LegalDocumentResponse> published() {
        return legalService.published();
    }

    @GetMapping("/api/v1/legal/published/{type}")
    public LegalDocumentResponse publishedByType(@PathVariable String type) {
        return legalService.publishedByType(LegalDocumentType.valueOf(type.trim().toUpperCase()));
    }

    @GetMapping("/api/v1/admin/legal")
    public List<LegalDocumentResponse> all() {
        return legalService.allByType();
    }

    @PostMapping("/api/v1/admin/legal")
    @ResponseStatus(HttpStatus.CREATED)
    public LegalDocumentResponse createDraft(@Valid @RequestBody LegalDocumentRequest request,
                                             @AuthenticationPrincipal CurrentUser user) {
        return legalService.createDraft(request, user);
    }

    @PostMapping("/api/v1/admin/legal/{id}/publish")
    public LegalDocumentResponse publish(@PathVariable UUID id, @AuthenticationPrincipal CurrentUser user) {
        return legalService.publish(id, user);
    }

    @PostMapping("/api/v1/admin/legal/{id}/archive")
    public LegalDocumentResponse archive(@PathVariable UUID id, @AuthenticationPrincipal CurrentUser user) {
        return legalService.archive(id, user);
    }
}
