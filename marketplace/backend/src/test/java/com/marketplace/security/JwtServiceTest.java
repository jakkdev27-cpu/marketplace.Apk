package com.marketplace.security;

import com.marketplace.config.AppProperties;
import com.marketplace.entity.Role;
import com.marketplace.entity.User;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class JwtServiceTest {

    private JwtService jwtService() {
        AppProperties props = new AppProperties(
                "test-secret-key-with-at-least-32-chars!",
                15,
                7,
                "http://localhost:5173",
                "http://localhost:5173");
        return new JwtService(props);
    }

    @Test
    void generatesAndParsesToken() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("acheteur@demo.fr");
        user.setRole(Role.BUYER);

        String token = jwtService().generateAccessToken(user);
        assertNotNull(token);

        Claims claims = jwtService().parse(token);
        assertEquals("acheteur@demo.fr", claims.getSubject());
        assertEquals("BUYER", claims.get("role", String.class));
        assertEquals(user.getId().toString(), claims.get("uid", String.class));
    }
}
