package com.gurujadhav.com.gurujadhav.atomurl.url;

import java.time.LocalDateTime;

public interface UserUrlProjection {
    Long getId();
    String getLongUrl();
    LocalDateTime getCreatedDate();
    Long getTotalClicks();
}
