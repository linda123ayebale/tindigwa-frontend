package org.example.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "expense_categories")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ExpenseCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "category_name", nullable = false, unique = true)
    private String categoryName;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "parent_category_id")
    private Long parentCategoryId; // For subcategories
    
    @Column(name = "sort_order")
    private Integer sortOrder = 0;
    
    @Column(name = "budget_limit")
    private Double budgetLimit;
    
    @Column(name = "color_code")
    private String colorCode;
    
    @Column(name = "icon")
    private String icon;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "created_by")
    private String createdBy;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isActive == null) {
            isActive = true;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Helper method to check if this is a parent category
    public boolean isParentCategory() {
        return parentCategoryId == null;
    }
    
    // Helper method to check if this is a subcategory
    public boolean isSubcategory() {
        return parentCategoryId != null;
    }
}package org.example.Entities;

import lombok.*;
import javax.persistence.*;

@Entity
@Table(name = "expense_categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String name;
    
    private String description;
    
    private String colorCode; // Frontend color coding

    public ExpenseCategory(String name, String description) {
        this.name = name;
        this.description = description;
    }
}
