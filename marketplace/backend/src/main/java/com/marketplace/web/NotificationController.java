package com.marketplace.web;

import com.marketplace.entity.Notification;
import com.marketplace.service.NotificationService;
import com.marketplace.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // DTO for notification response
    public record NotificationResponse(
            UUID id,
            UUID userId,
            String type,
            String message,
            boolean isRead,
            String relatedEntityType,
            UUID relatedEntityId,
            java.time.Instant createdAt
    ) {}

    @GetMapping
    public ResponseEntity<Page<NotificationResponse>> getNotifications(@AuthenticationPrincipal CurrentUser currentUser, Pageable pageable) {
        Page<Notification> notifications = notificationService.getNotifications(currentUser.getId(), pageable);
        Page<NotificationResponse> response = notifications.map(n -> new NotificationResponse(
                n.getId(),
                n.getUserId(),
                n.getType(),
                n.getMessage(),
                n.isIsRead(),
                n.getRelatedEntityType(),
                n.getRelatedEntityId(),
                n.getCreatedAt()
        ));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/unread")
    public ResponseEntity<Page<NotificationResponse>> getUnreadNotifications(@AuthenticationPrincipal CurrentUser currentUser, Pageable pageable) {
        Page<Notification> notifications = notificationService.getUnreadNotifications(currentUser.getId(), pageable);
        Page<NotificationResponse> response = notifications.map(n -> new NotificationResponse(
                n.getId(),
                n.getUserId(),
                n.getType(),
                n.getMessage(),
                n.isIsRead(),
                n.getRelatedEntityType(),
                n.getRelatedEntityId(),
                n.getCreatedAt()
        ));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(@AuthenticationPrincipal CurrentUser currentUser) {
        long count = notificationService.getUnreadCount(currentUser.getId());
        return ResponseEntity.ok(count);
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable UUID notificationId) {
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.noContent().build();
    }
}