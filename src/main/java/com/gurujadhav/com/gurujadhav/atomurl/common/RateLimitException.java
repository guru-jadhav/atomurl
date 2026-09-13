package com.gurujadhav.com.gurujadhav.atomurl.common;

public class RateLimitException extends RuntimeException  {
    public RateLimitException(String message) {
        super(message);
    }
}
