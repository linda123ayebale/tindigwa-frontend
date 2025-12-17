package org.example.Exceptions;

public class DuplicateCategoryException extends RuntimeException {
    private final String categoryName;
    
    public DuplicateCategoryException(String categoryName) {
        super("Category already exists with name: " + categoryName);
        this.categoryName = categoryName;
    }
    
    public String getCategoryName() {
        return categoryName;
    }
}
