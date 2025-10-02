package org.example.Repositories;

import org.example.Entities.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {
    
    // Find images by entity (e.g., all images for a specific client)
    List<Image> findByEntityTypeAndEntityIdAndIsActiveTrue(String entityType, Long entityId);
    
    // Find specific image by entity and type (e.g., client's passport photo)
    Optional<Image> findByEntityTypeAndEntityIdAndImageTypeAndIsActiveTrue(
            String entityType, Long entityId, String imageType);
    
    // Find images by category
    List<Image> findByImageCategoryAndIsActiveTrue(String imageCategory);
    
    // Find images uploaded by a specific user
    List<Image> findByUploadedByAndIsActiveTrue(Long uploadedBy);
    
    // Find images uploaded within a date range
    @Query("SELECT i FROM Image i WHERE i.uploadDate BETWEEN :startDate AND :endDate AND i.isActive = true")
    List<Image> findByUploadDateBetween(@Param("startDate") LocalDateTime startDate, 
                                       @Param("endDate") LocalDateTime endDate);
    
    // Find images by file type
    List<Image> findByContentTypeAndIsActiveTrue(String contentType);
    
    // Get all active images
    List<Image> findByIsActiveTrueOrderByUploadDateDesc();
    
    // Count images by entity type
    @Query("SELECT COUNT(i) FROM Image i WHERE i.entityType = :entityType AND i.isActive = true")
    long countByEntityType(@Param("entityType") String entityType);
    
    // Get total storage used by entity
    @Query("SELECT SUM(i.fileSize) FROM Image i WHERE i.entityType = :entityType AND i.isActive = true")
    Long getTotalStorageByEntityType(@Param("entityType") String entityType);
    
    // Find images larger than specific size
    List<Image> findByFileSizeGreaterThanAndIsActiveTrue(Long fileSize);
    
    // Custom query to find client's passport photo specifically
    @Query("""
        SELECT i FROM Image i 
        WHERE i.entityType = 'CLIENT' 
        AND i.entityId = :clientId 
        AND i.imageType = 'PASSPORT' 
        AND i.isActive = true
        ORDER BY i.uploadDate DESC
        LIMIT 1
        """)
    Optional<Image> findClientPassportPhoto(@Param("clientId") Long clientId);
    
    // Custom query to find loan officer's profile photo
    @Query("""
        SELECT i FROM Image i 
        WHERE i.entityType = 'LOAN_OFFICER' 
        AND i.entityId = :loanOfficerId 
        AND i.imageType = 'PROFILE' 
        AND i.isActive = true
        ORDER BY i.uploadDate DESC
        LIMIT 1
        """)
    Optional<Image> findLoanOfficerProfilePhoto(@Param("loanOfficerId") Long loanOfficerId);
    
    // Find all images for a specific entity with pagination-friendly query
    @Query("""
        SELECT i FROM Image i 
        WHERE i.entityType = :entityType 
        AND i.entityId = :entityId 
        AND i.isActive = true
        ORDER BY i.uploadDate DESC
        """)
    List<Image> findAllImagesForEntity(@Param("entityType") String entityType, 
                                     @Param("entityId") Long entityId);
    
    // Soft delete - mark as inactive instead of actual deletion
    @Query("UPDATE Image i SET i.isActive = false WHERE i.id = :imageId")
    void softDeleteById(@Param("imageId") Long imageId);
    
    // Find recently uploaded images (last 30 days)
    @Query("SELECT i FROM Image i WHERE i.uploadDate >= :thirtyDaysAgo AND i.isActive = true ORDER BY i.uploadDate DESC")
    List<Image> findRecentlyUploaded(@Param("thirtyDaysAgo") LocalDateTime thirtyDaysAgo);
    
    // Statistics queries
    @Query("SELECT i.entityType, COUNT(i) FROM Image i WHERE i.isActive = true GROUP BY i.entityType")
    List<Object[]> getImageCountByEntityType();
    
    @Query("SELECT i.imageType, COUNT(i) FROM Image i WHERE i.isActive = true GROUP BY i.imageType")
    List<Object[]> getImageCountByType();
}