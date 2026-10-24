package com.gurujadhav.com.gurujadhav.atomurl.auth.oauth;

import org.springframework.http.HttpStatus;

import com.gurujadhav.com.gurujadhav.atomurl.common.BaseApiException;

public class OAuthAuthenticationException extends BaseApiException {

    public OAuthAuthenticationException(String message) {
        super(HttpStatus.UNAUTHORIZED, message);
    }

    public OAuthAuthenticationException(String message, Throwable cause) {
        super(HttpStatus.UNAUTHORIZED, message, cause);
    }

}