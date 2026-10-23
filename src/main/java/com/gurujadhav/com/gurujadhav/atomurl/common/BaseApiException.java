package com.gurujadhav.com.gurujadhav.atomurl.common;

import org.springframework.http.HttpStatus;

import lombok.Getter;

@Getter
public class BaseApiException extends RuntimeException {
    private HttpStatus statusCode;

    public BaseApiException(HttpStatus statusCode, String message) {
        super(message);
        this.statusCode = statusCode;
    }

    public BaseApiException(HttpStatus satusCode, String message, Throwable cause) {
        super(message, cause);
        this.statusCode = satusCode;
    }
}
