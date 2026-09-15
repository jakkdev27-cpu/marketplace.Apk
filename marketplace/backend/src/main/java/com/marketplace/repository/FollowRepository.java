package com.marketplace.repository;

import com.marketplace.entity.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FollowRepository extends JpaRepository<Follow, UUID> {

    List<Follow> findByFollowerId(UUID followerId);

    List<Follow> findByFollowedId(UUID followedId);

    Optional<Follow> findByFollowerIdAndFollowedId(UUID followerId, UUID followedId);

    void deleteByFollowerIdAndFollowedId(UUID followerId, UUID followedId);
}