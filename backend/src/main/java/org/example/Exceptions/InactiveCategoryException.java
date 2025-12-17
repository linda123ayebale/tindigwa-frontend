package org.example.Exceptions;

public class InactiveCategoryException extends RuntimeException {
    private final String categoryName;
    
    public InactiveCategoryException(String categoryName) {
        super("Cannot use inactive category: " + categoryName);
        this.categoryName = categoryName;
    }
    
    public String getCategoryName() {
        return categoryName;
    }
}
