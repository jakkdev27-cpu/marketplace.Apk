package com.marketplace.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.Objects;
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

    @EmbeddedId
    private FollowId id = new FollowId();

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    // Embedded composite primary key
    public static class FollowId {
        @Column(name = "follower_id", nullable = false)
        private UUID followerId;

        @Column(name = "followed_id", nullable = false)
        private UUID followedId;

        // Default constructor
        public FollowId() {}

        public FollowId(UUID followerId, UUID followedId) {
            this.followerId = followerId;
            this.followedId = followedId;
        }

        public UUID getFollowerId() {
            return followerId;
        }

        public void setFollowerId(UUID followerId) {
            this.followerId = followerId;
        }

        public UUID getFollowedId() {
            return followedId;
        }

        public void setFollowedId(UUID followedId) {
            this.followedId = followedId;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof FollowId)) return false;
            FollowId that = (FollowId) o;
            return Objects.equals(followerId, that.followerId) &&
                   Objects.equals(followedId, that.followedId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(followerId, followedId);
        }
    }
}
