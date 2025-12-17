package org.example.Services;

import org.example.DTOs.ExpenseCategoryRequestDTO;
import org.example.DTOs.ExpenseCategoryResponseDTO;
import org.example.Entities.ExpenseCategory;
import org.example.Mappers.ExpenseCategoryMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Facade service for ExpenseCategory operations using DTOs
 * This wraps the existing ExpenseCategoryService and provides DTO-based interface
 */
@Service
public class ExpenseCategoryFacadeService {
    
    @Autowired
    private ExpenseCategoryService categoryService;
    
    @Autowired
    private ExpenseCategoryMapper mapper;
    
    public ExpenseCategoryResponseDTO createCategory(ExpenseCategoryRequestDTO requestDTO) {
        ExpenseCategory entity = mapper.toEntity(requestDTO);
        ExpenseCategory saved = categoryService.createCategory(entity);
        return mapper.toResponseDTO(saved);
    }
    
    public List<ExpenseCategoryResponseDTO> getAllActiveCategories() {
        return categoryService.getAllActiveCategories().stream()
                .map(mapper::toResponseDTO)
                .collect(Collectors.toList());
    }
    
    public List<ExpenseCategoryResponseDTO> getAllCategories() {
        return categoryService.getAllCategories().stream()
                .map(mapper::toResponseDTO)
                .collect(Collectors.toList());
    }
    
    public ExpenseCategoryResponseDTO getCategoryById(Long id) {
        return categoryService.getCategoryById(id)
                .map(mapper::toResponseDTO)
                .orElse(null);
    }
    
    public ExpenseCategoryResponseDTO updateCategory(Long id, ExpenseCategoryRequestDTO requestDTO) {
        ExpenseCategory existing = categoryService.getCategoryById(id)
                .orElseThrow(() -> new org.example.Exceptions.CategoryNotFoundException(id));
        
        mapper.updateEntityFromDto(requestDTO, existing);
        
        ExpenseCategory updated = categoryService.updateCategory(id, existing);
        return mapper.toResponseDTO(updated);
    }
    
    public void deleteCategory(Long id) {
        categoryService.deleteCategory(id);
    }
    
    public ExpenseCategoryResponseDTO deactivateCategory(Long id) {
        ExpenseCategory deactivated = categoryService.deactivateCategory(id);
        return mapper.toResponseDTO(deactivated);
    }
    
    public ExpenseCategoryResponseDTO activateCategory(Long id) {
        ExpenseCategory activated = categoryService.activateCategory(id);
        return mapper.toResponseDTO(activated);
    }
    
    public List<String> getCategoryNames() {
        return categoryService.getCategoryNames();
    }
}
