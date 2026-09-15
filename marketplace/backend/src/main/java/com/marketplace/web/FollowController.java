package com.marketplace.web;

import com.marketplace.entity.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.marketplace.service.FollowService;
import com.marketplace.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/follow")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;

    // DTO for user representation in follow responses
    public record UserDTO(UUID id, String firstName, String lastName) {}

    @PostMapping("/{followedId}")
    public ResponseEntity<Void> follow(@PathVariable UUID followedId, @AuthenticationPrincipal CurrentUser currentUser) {
        followService.follow(currentUser.id(), followedId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{followedId}")
    public ResponseEntity<Void> unfollow(@PathVariable UUID followedId, @AuthenticationPrincipal CurrentUser currentUser) {
        followService.unfollow(currentUser.id(), followedId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/followers")
    public ResponseEntity<List<UserDTO>> getFollowers(@AuthenticationPrincipal CurrentUser currentUser) {
        List<User> followers = followService.getFollowers(currentUser.id());
        List<UserDTO> followerDTOs = followers.stream()
                .map(u -> new UserDTO(u.getId(), u.getFirstName(), u.getLastName()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(followerDTOs);
    }

    @GetMapping("/following")
    public ResponseEntity<List<UserDTO>> getFollowing(@AuthenticationPrincipal CurrentUser currentUser) {
        List<User> following = followService.getFollowing(currentUser.id());
        List<UserDTO> followingDTOs = following.stream()
                .map(u -> new UserDTO(u.getId(), u.getFirstName(), u.getLastName()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(followingDTOs);
    }
}