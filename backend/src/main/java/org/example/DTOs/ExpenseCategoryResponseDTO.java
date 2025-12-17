package org.example.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExpenseCategoryResponseDTO {
    private Long id;
    private String categoryName;
    private String description;
    private Boolean isActive;
    private Integer sortOrder;
    private String colorCode;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
