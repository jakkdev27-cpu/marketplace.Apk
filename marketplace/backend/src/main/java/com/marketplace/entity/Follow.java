package com.marketplace.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
    name = "user_follows",
    indexes = {
        @Index(name = "idx_user_follows_follower", columnList = "follower_id"),
        @Index(name = "idx_user_follows_followed", columnList = "followed_id")
    }
)
@Getter
@Setter
public class Follow {

    @Id
    @Column(name = "follower_id", nullable = false)
    private UUID followerId;

    @Id
    @Column(name = "followed_id", nullable = false)
    private UUID followedId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();
}