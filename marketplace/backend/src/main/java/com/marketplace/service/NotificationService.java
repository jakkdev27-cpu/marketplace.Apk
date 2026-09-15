package com.marketplace.service;

import com.marketplace.entity.Notification;
import com.marketplace.entity.User;
import com.marketplace.repository.NotificationRepository;
import com.marketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<Notification> getNotifications(UUID userId, Pageable pageable) {
        return notificationRepository.findByUserId(userId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Notification> getUnreadNotifications(UUID userId, Pageable pageable) {
        return notificationRepository.findByUserIdAndIsReadFalse(userId, pageable);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllAsRead(userId);
    }

    @Transactional
    public void deleteNotification(UUID notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    @Transactional
    public void createFollowNotification(UUID followerId, UUID followedId) {
        User follower = userRepository.getReferenceById(followerId);
        Notification notification = new Notification();
        notification.setUserId(followedId);
        notification.setType("FOLLOW");
        notification.setMessage(follower.getFirstName() + " " + follower.getLastName() + " vous suit maintenant");
        notification.setRelatedEntityType("USER");
        notification.setRelatedEntityId(followerId);
        notificationRepository.save(notification);
    }

    @Transactional
    public void createOrderStatusNotification(UUID userId, UUID orderId, String newStatus) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType("ORDER_STATUS");
        notification.setMessage("Le statut de votre commande a changé vers " + newStatus);
        notification.setRelatedEntityType("ORDER");
        notification.setRelatedEntityId(orderId);
        notificationRepository.save(notification);
    }
}