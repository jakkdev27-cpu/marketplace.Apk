package com.marketplace.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(
        String jwtSecret,
        long jwtAccessTtlMinutes,
        long jwtRefreshTtlDays,
        String corsAllowedOrigins,
        String frontendUrl
) {
}
