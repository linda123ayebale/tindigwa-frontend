package org.example.Services;

import org.example.Config.CacheConfig;
import org.example.Entities.ExpenseCategory;
import org.example.Events.ExpenseCategoryCreatedEvent;
import org.example.Events.ExpenseCategoryUpdatedEvent;
import org.example.Exceptions.CategoryInUseException;
import org.example.Exceptions.CategoryNotFoundException;
import org.example.Exceptions.DuplicateCategoryException;
import org.example.Repositories.ExpenseCategoryRepository;
import org.example.Repositories.OperationalExpensesRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ExpenseCategoryService {
    private final ExpenseCategoryRepository repository;
    private final OperationalExpensesRepository expensesRepository;
    private final ApplicationEventPublisher eventPublisher;

    public ExpenseCategoryService(ExpenseCategoryRepository repository, 
                                  OperationalExpensesRepository expensesRepository,
                                  ApplicationEventPublisher eventPublisher) {
        this.repository = repository;
        this.expensesRepository = expensesRepository;
        this.eventPublisher = eventPublisher;
    }

    @Caching(evict = {
        @CacheEvict(value = CacheConfig.ACTIVE_CATEGORIES_CACHE, allEntries = true),
        @CacheEvict(value = CacheConfig.CATEGORIES_CACHE, allEntries = true),
        @CacheEvict(value = CacheConfig.CATEGORY_NAMES_CACHE, allEntries = true)
    })
    public ExpenseCategory createCategory(ExpenseCategory category) {
        if (repository.existsByCategoryNameIgnoreCase(category.getCategoryName())) {
            throw new DuplicateCategoryException(category.getCategoryName());
        }
        ExpenseCategory savedCategory = repository.save(category);
        eventPublisher.publishEvent(new ExpenseCategoryCreatedEvent(savedCategory));
        return savedCategory;
    }

    @Cacheable(value = CacheConfig.ACTIVE_CATEGORIES_CACHE)
    public List<ExpenseCategory> getAllActiveCategories() {
        return repository.findByIsActiveTrueOrderByCreatedAtDesc();
    }

    public Optional<ExpenseCategory> getCategoryById(Long id) {
        return repository.findById(id)
                .filter(ExpenseCategory::getIsActive);
    }

    @Caching(evict = {
        @CacheEvict(value = CacheConfig.ACTIVE_CATEGORIES_CACHE, allEntries = true),
        @CacheEvict(value = CacheConfig.CATEGORIES_CACHE, allEntries = true),
        @CacheEvict(value = CacheConfig.CATEGORY_NAMES_CACHE, allEntries = true)
    })
    public ExpenseCategory updateCategory(Long id, ExpenseCategory categoryDetails) {
        return repository.findById(id)
                .map(existing -> {
                    if (!existing.getCategoryName().equalsIgnoreCase(categoryDetails.getCategoryName()) &&
                        repository.existsByCategoryNameIgnoreCase(categoryDetails.getCategoryName())) {
                        throw new DuplicateCategoryException(categoryDetails.getCategoryName());
                    }
                    
                    existing.setCategoryName(categoryDetails.getCategoryName());
                    existing.setDescription(categoryDetails.getDescription());
                    existing.setColorCode(categoryDetails.getColorCode());
                    
                    ExpenseCategory saved = repository.save(existing);
                    eventPublisher.publishEvent(new ExpenseCategoryUpdatedEvent(saved));
                    return saved;
                })
                .orElseThrow(() -> new CategoryNotFoundException(id));
    }

    @Caching(evict = {
        @CacheEvict(value = CacheConfig.ACTIVE_CATEGORIES_CACHE, allEntries = true),
        @CacheEvict(value = CacheConfig.CATEGORIES_CACHE, allEntries = true),
        @CacheEvict(value = CacheConfig.CATEGORY_NAMES_CACHE, allEntries = true)
    })
    public void deleteCategory(Long id) {
        // Check if category exists
        ExpenseCategory category = repository.findById(id)
                .orElseThrow(() -> new CategoryNotFoundException(id));
        
        // Check if category has associated expenses
        long expenseCount = expensesRepository.findByCategoryCategoryName(category.getCategoryName()).size();
        if (expenseCount > 0) {
            throw new CategoryInUseException(id, expenseCount);
        }
        
        // Safe to delete
        repository.deleteById(id);
    }

    @Cacheable(value = CacheConfig.CATEGORY_NAMES_CACHE)
    public List<String> getCategoryNames() {
        return repository.findByIsActiveTrue().stream()
                .map(ExpenseCategory::getCategoryName)
                .collect(Collectors.toList());
    }
    
    // Soft delete - deactivate category instead of deleting
    @Caching(evict = {
        @CacheEvict(value = CacheConfig.ACTIVE_CATEGORIES_CACHE, allEntries = true),
        @CacheEvict(value = CacheConfig.CATEGORIES_CACHE, allEntries = true),
        @CacheEvict(value = CacheConfig.CATEGORY_NAMES_CACHE, allEntries = true)
    })
    public ExpenseCategory deactivateCategory(Long id) {
        return repository.findById(id)
                .map(category -> {
                    category.setIsActive(false);
                    return repository.save(category);
                })
                .orElseThrow(() -> new CategoryNotFoundException(id));
    }
    
    // Reactivate a deactivated category
    @Caching(evict = {
        @CacheEvict(value = CacheConfig.ACTIVE_CATEGORIES_CACHE, allEntries = true),
        @CacheEvict(value = CacheConfig.CATEGORIES_CACHE, allEntries = true),
        @CacheEvict(value = CacheConfig.CATEGORY_NAMES_CACHE, allEntries = true)
    })
    public ExpenseCategory activateCategory(Long id) {
        return repository.findById(id)
                .map(category -> {
                    category.setIsActive(true);
                    return repository.save(category);
                })
                .orElseThrow(() -> new CategoryNotFoundException(id));
    }
    
    // Get all categories including inactive ones (for admin purposes)
    @Cacheable(value = CacheConfig.CATEGORIES_CACHE)
    public List<ExpenseCategory> getAllCategories() {
        return repository.findAll();
    }
}
