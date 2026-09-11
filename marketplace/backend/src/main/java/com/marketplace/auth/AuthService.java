package com.marketplace.auth;

import com.marketplace.audit.AuditService;
import com.marketplace.config.AppProperties;
import com.marketplace.entity.LegalConsent;
import com.marketplace.entity.LegalDocument;
import com.marketplace.entity.LegalDocumentStatus;
import com.marketplace.entity.RefreshToken;
import com.marketplace.entity.Role;
import com.marketplace.entity.User;
import com.marketplace.exception.ApiException;
import com.marketplace.repository.LegalConsentRepository;
import com.marketplace.repository.LegalDocumentRepository;
import com.marketplace.repository.RefreshTokenRepository;
import com.marketplace.repository.UserRepository;
import com.marketplace.security.JwtService;
import com.marketplace.util.Hashes;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final LegalDocumentRepository legalDocumentRepository;
    private final LegalConsentRepository legalConsentRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AuditService auditService;
    private final AppProperties appProperties;

    @Transactional
    public AuthController.AuthResponse register(AuthController.RegisterRequest request, HttpServletRequest httpRequest) {
        String email = request.email().toLowerCase().trim();
        if (userRepository.existsByEmail(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "EMAIL_TAKEN", "Cet email est déjà utilisé");
        }

        // Consentement explicite et jamais précoché : tous les documents PUBLISHED doivent être acceptés.
        List<LegalDocument> published = legalDocumentRepository.findByStatusOrderByTypeAscVersionDesc(LegalDocumentStatus.PUBLISHED);
        Set<UUID> accepted = request.acceptedDocumentIds() == null ? Set.of() : Set.copyOf(request.acceptedDocumentIds());
        for (LegalDocument doc : published) {
            if (!accepted.contains(doc.getId())) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "CONSENT_REQUIRED",
                        "Le document « " + doc.getTitle() + " » doit être accepté pour créer un compte");
            }
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setRole(request.seller() ? Role.SELLER : Role.BUYER);
        userRepository.save(user);

        // Enregistrement des consentements avec version du document + preuve technique.
        String ip = AuditService.clientIp(httpRequest);
        String userAgent = httpRequest == null ? null : httpRequest.getHeader("User-Agent");
        for (UUID documentId : accepted) {
            LegalDocument doc = legalDocumentRepository.findById(documentId)
                    .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "UNKNOWN_DOCUMENT", "Document légal inconnu"));
            LegalConsent consent = new LegalConsent();
            consent.setUser(user);
            consent.setLegalDocument(doc);
            consent.setDocumentVersion(doc.getVersion());
            consent.setIpAddress(ip);
            consent.setUserAgent(userAgent);
            legalConsentRepository.save(consent);
        }

        auditService.log(user.getId(), "USER_REGISTERED", "User", user.getId().toString(), "role=" + user.getRole(), httpRequest);
        return issueTokens(user);
    }

    @Transactional
    public AuthController.AuthResponse login(AuthController.LoginRequest request, HttpServletRequest httpRequest) {
        String email = request.email().toLowerCase().trim();
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, request.password()));
        } catch (BadCredentialsException e) {
            // Message unique : ne révèle pas si l'email existe.
            throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Email ou mot de passe incorrect");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Email ou mot de passe incorrect"));
        auditService.log(user.getId(), "USER_LOGIN", "User", user.getId().toString(), null, httpRequest);
        return issueTokens(user);
    }

    @Transactional
    public AuthController.AuthResponse refresh(AuthController.RefreshRequest request) {
        RefreshToken token = refreshTokenRepository.findByTokenHash(Hashes.sha256Hex(request.refreshToken()))
                .filter(t -> !t.isRevoked() && t.getExpiresAt().isAfter(Instant.now()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_REFRESH_TOKEN", "Refresh token invalide ou expiré"));
        // Rotation : l'ancien refresh token est révoqué dès réutilisation.
        token.setRevoked(true);
        return issueTokens(token.getUser());
    }

    @Transactional
    public void logout(AuthController.RefreshRequest request) {
        if (request.refreshToken() != null) {
            refreshTokenRepository.findByTokenHash(Hashes.sha256Hex(request.refreshToken()))
                    .ifPresent(token -> token.setRevoked(true));
        }
    }

    private AuthController.AuthResponse issueTokens(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = UUID.randomUUID() + UUID.randomUUID().toString();
        RefreshToken entity = new RefreshToken();
        entity.setUser(user);
        entity.setTokenHash(Hashes.sha256Hex(refreshToken));
        entity.setExpiresAt(Instant.now().plus(appProperties.jwtRefreshTtlDays(), ChronoUnit.DAYS));
        refreshTokenRepository.save(entity);
        return new AuthController.AuthResponse(
                accessToken,
                refreshToken,
                "Bearer",
                appProperties.jwtAccessTtlMinutes() * 60,
                new AuthController.UserResponse(user.getId(), user.getEmail(), user.getFirstName(), user.getLastName(), user.getRole().name()));
    }
}
