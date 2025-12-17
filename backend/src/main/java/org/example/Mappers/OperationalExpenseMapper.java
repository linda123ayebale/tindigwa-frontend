package org.example.Mappers;

import org.example.DTOs.OperationalExpenseRequestDTO;
import org.example.DTOs.OperationalExpenseResponseDTO;
import org.example.Entities.ExpenseCategory;
import org.example.Entities.OperationalExpenses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class OperationalExpenseMapper {
    
    @Autowired
    private ExpenseCategoryMapper categoryMapper;
    
    /**
     * Convert OperationalExpenseRequestDTO to OperationalExpenses entity
     * Note: Category must be set separately by the service layer
     */
    public OperationalExpenses toEntity(OperationalExpenseRequestDTO dto) {
        if (dto == null) {
            return null;
        }
        
        OperationalExpenses entity = new OperationalExpenses();
        entity.setExpenseName(dto.getExpenseName());
        entity.setDescription(dto.getDescription());
        entity.setAmount(dto.getAmount());
        entity.setExpenseDate(dto.getExpenseDate());
        entity.setPaymentMethod(dto.getPaymentMethod());
        entity.setVendor(dto.getVendor());
        entity.setReferenceNumber(dto.getReferenceNumber());
        entity.setStatus(dto.getStatus() != null ? dto.getStatus() : "pending");
        entity.setNotes(dto.getNotes());
        entity.setCreatedBy(dto.getCreatedBy());
        
        // Set approval status based on needsApproval flag
        if (dto.getNeedsApproval() != null && !dto.getNeedsApproval()) {
            entity.setApprovalStatus("APPROVED");
            entity.setApprovedAt(java.time.LocalDateTime.now());
        } else {
            entity.setApprovalStatus("PENDING");
        }
        
        entity.setPaymentStatus("UNPAID");
        
        // Category will be set by service layer after validation
        
        return entity;
    }
    
    /**
     * Update existing OperationalExpenses entity from OperationalExpenseRequestDTO
     * Note: Category must be handled separately by the service layer
     */
    public void updateEntityFromDto(OperationalExpenseRequestDTO dto, OperationalExpenses entity) {
        if (dto == null || entity == null) {
            return;
        }
        
        entity.setExpenseName(dto.getExpenseName());
        entity.setDescription(dto.getDescription());
        entity.setAmount(dto.getAmount());
        entity.setExpenseDate(dto.getExpenseDate());
        entity.setPaymentMethod(dto.getPaymentMethod());
        entity.setVendor(dto.getVendor());
        entity.setReferenceNumber(dto.getReferenceNumber());
        
        if (dto.getStatus() != null) {
            entity.setStatus(dto.getStatus());
        }
        
        entity.setNotes(dto.getNotes());
        
        if (dto.getCreatedBy() != null) {
            entity.setCreatedBy(dto.getCreatedBy());
        }
        
        // Category will be updated by service layer if categoryId is provided
    }
    
    /**
     * Convert OperationalExpenses entity to OperationalExpenseResponseDTO
     */
    public OperationalExpenseResponseDTO toResponseDTO(OperationalExpenses entity) {
        if (entity == null) {
            return null;
        }
        
        OperationalExpenseResponseDTO dto = new OperationalExpenseResponseDTO();
        dto.setId(entity.getId());
        dto.setExpenseReference(entity.getExpenseReference());
        dto.setExpenseName(entity.getExpenseName());
        dto.setDescription(entity.getDescription());
        dto.setAmount(entity.getAmount());
        dto.setExpenseDate(entity.getExpenseDate());
        dto.setPaymentMethod(entity.getPaymentMethod());
        dto.setVendor(entity.getVendor());
        dto.setReferenceNumber(entity.getReferenceNumber());
        dto.setReceiptUrl(entity.getReceiptUrl());
        dto.setStatus(entity.getStatus());
        dto.setNotes(entity.getNotes());
        dto.setCreatedBy(entity.getCreatedBy());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        
        // Map approval fields
        dto.setApprovalStatus(entity.getApprovalStatus());
        dto.setApprovalComment(entity.getApprovalComment());
        dto.setApprovedAt(entity.getApprovedAt());
        
        // Map payment fields
        dto.setPaymentStatus(entity.getPaymentStatus());
        dto.setPaidAt(entity.getPaidAt());
        
        // Map user ID fields (for frontend to lookup names from auth token)
        dto.setRequestedByUserId(entity.getRequestedByUserId());
        dto.setApprovedByUserId(entity.getApprovedByUserId());
        dto.setPaidByUserId(entity.getPaidByUserId());
        
        // Map category
        if (entity.getCategory() != null) {
            dto.setCategory(categoryMapper.toResponseDTO(entity.getCategory()));
        }
        
        return dto;
    }
}
