package com.gurujadhav.com.gurujadhav.atomurl.jwt;

public class InvalidTokenException extends RuntimeException {

    public InvalidTokenException(String message) {
        super(message);
    }
}
