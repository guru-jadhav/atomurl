package com.gurujadhav.com.gurujadhav.atomurl.auth;

import com.gurujadhav.com.gurujadhav.atomurl.common.BaseApiException;
import org.springframework.http.HttpStatus;

public class InvalidOtpException extends BaseApiException {
    public InvalidOtpException(String message) {
        super(HttpStatus.BAD_REQUEST, message);
    }
}
