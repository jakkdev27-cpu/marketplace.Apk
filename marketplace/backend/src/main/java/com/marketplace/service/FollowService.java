package com.marketplace.service;

import com.marketplace.entity.Follow;
import com.marketplace.entity.User;
import com.marketplace.exception.ApiException;
import com.marketplace.repository.FollowRepository;
import com.marketplace.repository.UserRepository;
import com.marketplace.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public void follow(UUID followerId, UUID followedId) {
        if (followerId.equals(followedId)) {
            throw new ApiException(org.springframework.http.HttpStatus.BAD_REQUEST, "CANNOT_FOLLOW_SELF", "Vous ne pouvez pas vous suivre vous-même");
        }
        if (followRepository.findByFollowerIdAndFollowedId(followerId, followedId).isPresent()) {
            throw new ApiException(org.springframework.http.HttpStatus.BAD_REQUEST, "ALREADY_FOLLOWING", "Vous suivez déjà cet utilisateur");
        }
        Follow follow = new Follow();
        follow.setFollowerId(followerId);
        follow.setFollowedId(followedId);
        followRepository.save(follow);
        // Create notification for the followed user
        User follower = userRepository.getReferenceById(followerId);
        notificationService.createFollowNotification(followerId, followedId);
    }

    @Transactional
    public void unfollow(UUID followerId, UUID followedId) {
        followRepository.deleteByFollowerIdAndFollowedId(followerId, followedId);
    }

    public List<User> getFollowers(UUID userId) {
        List<Follow> follows = followRepository.findByFollowedId(userId);
        List<UUID> followerIds = follows.stream().map(Follow::getFollowerId).collect(Collectors.toList());
        return userRepository.findAllById(followerIds);
    }

    public List<User> getFollowing(UUID userId) {
        List<Follow> follows = followRepository.findByFollowerId(userId);
        List<UUID> followedIds = follows.stream().map(Follow::getFollowedId).collect(Collectors.toList());
        return userRepository.findAllById(followedIds);
    }
}