package com.marketplace.security;

import com.marketplace.entity.Role;

import java.util.UUID;

/** Principal authentifié placé dans le SecurityContext. */
public record CurrentUser(UUID id, String email, Role role) {
}
