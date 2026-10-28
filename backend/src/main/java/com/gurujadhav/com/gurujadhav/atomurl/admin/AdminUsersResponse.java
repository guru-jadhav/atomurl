package com.gurujadhav.com.gurujadhav.atomurl.admin;

import java.util.List;

public record AdminUsersResponse(
    List<AdminUserProjection> users,
    long total,
    int page,
    int totalPages
) {}

