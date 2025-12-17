package org.example.Services;

import org.example.DTOs.OperationalExpenseRequestDTO;
import org.example.DTOs.OperationalExpenseResponseDTO;
import org.example.Entities.ExpenseCategory;
import org.example.Entities.OperationalExpenses;
import org.example.Exceptions.CategoryNotFoundException;
import org.example.Mappers.OperationalExpenseMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Facade service for OperationalExpenses operations using DTOs
 * This wraps the existing OperationalExpensesService and provides DTO-based interface
 */
@Service
public class OperationalExpenseFacadeService {
    
    @Autowired
    private OperationalExpensesService expenseService;
    
    @Autowired
    private ExpenseCategoryService categoryService;
    
    @Autowired
    private OperationalExpenseMapper mapper;
    
    public OperationalExpenseResponseDTO createExpense(OperationalExpenseRequestDTO requestDTO) {
        // Create entity from DTO
        OperationalExpenses entity = mapper.toEntity(requestDTO);
        
        // Fetch and set the category
        ExpenseCategory category = categoryService.getCategoryById(requestDTO.getCategoryId())
                .orElseThrow(() -> new CategoryNotFoundException(requestDTO.getCategoryId()));
        entity.setCategory(category);
        
        // Save and return
        OperationalExpenses saved = expenseService.createExpense(entity);
        return mapper.toResponseDTO(saved);
    }
    
    public List<OperationalExpenseResponseDTO> getAllExpenses() {
        return expenseService.getAllExpenses().stream()
                .map(mapper::toResponseDTO)
                .collect(Collectors.toList());
    }
    
    public Page<OperationalExpenseResponseDTO> getAllExpenses(Pageable pageable) {
        Page<OperationalExpenses> expensePage = expenseService.getAllExpenses(pageable);
        List<OperationalExpenseResponseDTO> dtoList = expensePage.getContent().stream()
                .map(mapper::toResponseDTO)
                .collect(Collectors.toList());
        return new PageImpl<>(dtoList, pageable, expensePage.getTotalElements());
    }
    
    public OperationalExpenseResponseDTO getExpenseById(Long id) {
        return expenseService.getExpenseById(id)
                .map(mapper::toResponseDTO)
                .orElse(null);
    }
    
    public OperationalExpenseResponseDTO getExpenseByReference(String reference) {
        return expenseService.getExpenseByReference(reference)
                .map(mapper::toResponseDTO)
                .orElse(null);
    }
    
    public OperationalExpenseResponseDTO updateExpense(Long id, OperationalExpenseRequestDTO requestDTO) {
        // Get existing expense
        OperationalExpenses existing = expenseService.getExpenseById(id)
                .orElseThrow(() -> new org.example.Exceptions.InvalidExpenseException("Expense not found with id: " + id));
        
        // Update fields from DTO
        mapper.updateEntityFromDto(requestDTO, existing);
        
        // Update category if provided
        ExpenseCategory category = categoryService.getCategoryById(requestDTO.getCategoryId())
                .orElseThrow(() -> new CategoryNotFoundException(requestDTO.getCategoryId()));
        existing.setCategory(category);
        
        // Save and return
        OperationalExpenses updated = expenseService.updateExpense(id, existing);
        return mapper.toResponseDTO(updated);
    }
    
    public void deleteExpense(Long id) {
        expenseService.deleteExpense(id);
    }
    
    public List<OperationalExpenseResponseDTO> getExpensesByCategory(String categoryName) {
        return expenseService.getExpensesByCategory(categoryName).stream()
                .map(mapper::toResponseDTO)
                .collect(Collectors.toList());
    }
    
    public List<OperationalExpenseResponseDTO> getExpensesByStatus(String status) {
        return expenseService.getExpensesByStatus(status).stream()
                .map(mapper::toResponseDTO)
                .collect(Collectors.toList());
    }
    
    public List<OperationalExpenseResponseDTO> getExpensesByDateRange(LocalDate startDate, LocalDate endDate) {
        return expenseService.getExpensesByDateRange(startDate, endDate).stream()
                .map(mapper::toResponseDTO)
                .collect(Collectors.toList());
    }
    
    public List<OperationalExpenseResponseDTO> getFilteredExpenses(
            String category, String status, LocalDate startDate, LocalDate endDate, String searchTerm) {
        return expenseService.getFilteredExpenses(category, status, startDate, endDate, searchTerm).stream()
                .map(mapper::toResponseDTO)
                .collect(Collectors.toList());
    }
    
    public OperationalExpenseResponseDTO updateExpenseStatus(Long id, String status) {
        OperationalExpenses updated = expenseService.updateExpenseStatus(id, status);
        return mapper.toResponseDTO(updated);
    }
    
    public OperationalExpenseResponseDTO approveExpense(Long id, String approvedBy, String approvalComment) {
        OperationalExpenses approved = expenseService.approveExpense(id, approvedBy, approvalComment);
        return mapper.toResponseDTO(approved);
    }
    
    public OperationalExpenseResponseDTO rejectExpense(Long id, String rejectedBy, String rejectionComment) {
        OperationalExpenses rejected = expenseService.rejectExpense(id, rejectedBy, rejectionComment);
        return mapper.toResponseDTO(rejected);
    }
    
    public OperationalExpenseResponseDTO markExpenseAsPaid(Long id, String paidBy) {
        OperationalExpenses paid = expenseService.markExpenseAsPaid(id, paidBy);
        return mapper.toResponseDTO(paid);
    }
    
    public List<OperationalExpenseResponseDTO> getExpensesByApprovalStatus(String approvalStatus) {
        return expenseService.getExpensesByApprovalStatus(approvalStatus).stream()
                .map(mapper::toResponseDTO)
                .collect(Collectors.toList());
    }
    
    public List<OperationalExpenseResponseDTO> getExpensesByPaymentStatus(String paymentStatus) {
        return expenseService.getExpensesByPaymentStatus(paymentStatus).stream()
                .map(mapper::toResponseDTO)
                .collect(Collectors.toList());
    }
    
    public List<OperationalExpenseResponseDTO> getApprovedUnpaidExpenses() {
        return expenseService.getApprovedUnpaidExpenses().stream()
                .map(mapper::toResponseDTO)
                .collect(Collectors.toList());
    }
}
