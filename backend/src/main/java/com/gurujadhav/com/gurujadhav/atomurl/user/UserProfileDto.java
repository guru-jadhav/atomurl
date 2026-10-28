package com.gurujadhav.com.gurujadhav.atomurl.user;

import java.time.LocalDateTime;

public record UserProfileDto(
    Long id,
    String email,
    String name,
    String signinProvider,
    LocalDateTime lastLoginDate,
    boolean isAdmin
) {}
