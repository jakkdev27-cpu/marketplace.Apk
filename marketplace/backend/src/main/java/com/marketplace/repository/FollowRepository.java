package com.marketplace.repository;

import com.marketplace.entity.Follow;
import com.marketplace.entity.Follow.FollowId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FollowRepository extends JpaRepository<Follow, FollowId> {

    List<Follow> findByIdFollowerId(UUID followerId);

    List<Follow> findByIdFollowedId(UUID followedId);

    Optional<Follow> findByIdFollowerIdAndIdFollowedId(UUID followerId, UUID followedId);

    void deleteByIdFollowerIdAndIdFollowedId(UUID followerId, UUID followedId);
}
