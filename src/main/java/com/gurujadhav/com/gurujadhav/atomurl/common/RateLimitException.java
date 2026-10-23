package com.gurujadhav.com.gurujadhav.atomurl.common;

import org.springframework.http.HttpStatus;

public class RateLimitException extends BaseApiException {
    public RateLimitException(String message) {
        super(HttpStatus.TOO_MANY_REQUESTS, message);
    }
}
