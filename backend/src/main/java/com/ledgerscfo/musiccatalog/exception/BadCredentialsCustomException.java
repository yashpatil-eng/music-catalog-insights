package com.ledgerscfo.musiccatalog.exception;

public class BadCredentialsCustomException extends RuntimeException {
    public BadCredentialsCustomException(String message) {
        super(message);
    }
}
