package org.example.Exceptions;

public class CategoryInUseException extends RuntimeException {
    private final Long categoryId;
    private final long expenseCount;
    
    public CategoryInUseException(Long categoryId, long expenseCount) {
        super(String.format("Cannot delete category with id %d: it has %d associated expenses. Consider deactivating instead.", 
            categoryId, expenseCount));
        this.categoryId = categoryId;
        this.expenseCount = expenseCount;
    }
    
    public Long getCategoryId() {
        return categoryId;
    }
    
    public long getExpenseCount() {
        return expenseCount;
    }
}
