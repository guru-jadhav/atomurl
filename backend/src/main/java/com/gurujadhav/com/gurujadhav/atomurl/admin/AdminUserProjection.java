package com.gurujadhav.com.gurujadhav.atomurl.admin;

import java.time.LocalDateTime;

public interface AdminUserProjection {
    Long getId();
    String getEmail();
    String getName();
    String getSigninProvider();
    LocalDateTime getLastLoginDate();
    Long getUrlCount();
}
