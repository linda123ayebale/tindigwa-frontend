package org.example.Exceptions;

public class InvalidExpenseException extends RuntimeException {
    public InvalidExpenseException(String message) {
        super(message);
    }
    
    public InvalidExpenseException(String message, Throwable cause) {
        super(message, cause);
    }
}
