package org.example.DTOs;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Request DTO for creating or updating an expense category")
public class ExpenseCategoryRequestDTO {
    
    @Schema(description = "Name of the expense category", example = "Office Supplies", required = true)
    @NotBlank(message = "Category name is required")
    @Size(min = 2, max = 100, message = "Category name must be between 2 and 100 characters")
    private String categoryName;
    
    @Schema(description = "Description of the category", example = "Expenses related to office supplies and stationery")
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
    
    @Schema(description = "Whether the category is active", example = "true", defaultValue = "true")
    private Boolean isActive = true;
    
    @Schema(description = "Sort order for displaying categories", example = "1", defaultValue = "0")
    private Integer sortOrder = 0;
    
    @Schema(description = "Color code for the category (hex format)", example = "#FF5733", defaultValue = "#000000")
    @Size(max = 7, message = "Color code must not exceed 7 characters")
    private String colorCode = "#000000";
}
