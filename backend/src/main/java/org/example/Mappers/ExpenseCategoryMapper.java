package org.example.Mappers;

import org.example.DTOs.ExpenseCategoryRequestDTO;
import org.example.DTOs.ExpenseCategoryResponseDTO;
import org.example.Entities.ExpenseCategory;
import org.springframework.stereotype.Component;

@Component
public class ExpenseCategoryMapper {
    
    /**
     * Convert ExpenseCategoryRequestDTO to ExpenseCategory entity
     */
    public ExpenseCategory toEntity(ExpenseCategoryRequestDTO dto) {
        if (dto == null) {
            return null;
        }
        
        ExpenseCategory entity = new ExpenseCategory();
        entity.setCategoryName(dto.getCategoryName());
        entity.setDescription(dto.getDescription());
        entity.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        entity.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
        entity.setColorCode(dto.getColorCode() != null ? dto.getColorCode() : "#000000");
        
        return entity;
    }
    
    /**
     * Update existing ExpenseCategory entity from ExpenseCategoryRequestDTO
     */
    public void updateEntityFromDto(ExpenseCategoryRequestDTO dto, ExpenseCategory entity) {
        if (dto == null || entity == null) {
            return;
        }
        
        entity.setCategoryName(dto.getCategoryName());
        entity.setDescription(dto.getDescription());
        
        if (dto.getIsActive() != null) {
            entity.setIsActive(dto.getIsActive());
        }
        if (dto.getSortOrder() != null) {
            entity.setSortOrder(dto.getSortOrder());
        }
        if (dto.getColorCode() != null) {
            entity.setColorCode(dto.getColorCode());
        }
    }
    
    /**
     * Convert ExpenseCategory entity to ExpenseCategoryResponseDTO
     */
    public ExpenseCategoryResponseDTO toResponseDTO(ExpenseCategory entity) {
        if (entity == null) {
            return null;
        }
        
        ExpenseCategoryResponseDTO dto = new ExpenseCategoryResponseDTO();
        dto.setId(entity.getId());
        dto.setCategoryName(entity.getCategoryName());
        dto.setDescription(entity.getDescription());
        dto.setIsActive(entity.getIsActive());
        dto.setSortOrder(entity.getSortOrder());
        dto.setColorCode(entity.getColorCode());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        
        return dto;
    }
}
