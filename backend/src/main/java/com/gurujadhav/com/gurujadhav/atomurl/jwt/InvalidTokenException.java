package com.gurujadhav.com.gurujadhav.atomurl.jwt;

import org.springframework.http.HttpStatus;

import com.gurujadhav.com.gurujadhav.atomurl.common.BaseApiException;

public class InvalidTokenException extends BaseApiException {

    public InvalidTokenException(String message) {
        super(HttpStatus.UNAUTHORIZED, message);
    }
}
