package org.example.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Image {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Generic reference fields - can reference any entity
    @Column(name = "entity_type", nullable = false)
    private String entityType; // "CLIENT", "LOAN_OFFICER", "DOCUMENT", "SIGNATURE", etc.
    
    @Column(name = "entity_id", nullable = false)
    private Long entityId; // ID of the referenced entity (client, loan officer, etc.)
    
    @Column(name = "image_type", nullable = false)
    private String imageType; // "PASSPORT", "PROFILE", "DOCUMENT", "SIGNATURE", "ID_CARD", etc.
    
    // File information
    @Column(name = "original_filename", nullable = false)
    private String originalFilename;
    
    @Column(name = "stored_filename", nullable = false)
    private String storedFilename;
    
    @Column(name = "file_path", nullable = false)
    private String filePath;
    
    @Column(name = "content_type", nullable = false)
    private String contentType; // "image/jpeg", "image/png", etc.
    
    @Column(name = "file_size", nullable = false)
    private Long fileSize; // Size in bytes
    
    // Metadata
    @Column(name = "upload_date", nullable = false)
    private LocalDateTime uploadDate;
    
    @Column(name = "uploaded_by")
    private Long uploadedBy; // User ID who uploaded the image
    
    @Column(name = "description")
    private String description; // Optional description
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true; // Soft delete flag
    
    @Column(name = "image_category")
    private String imageCategory; // "PERSONAL", "DOCUMENT", "VERIFICATION", etc.
    
    // Dimensions (optional, for display purposes)
    @Column(name = "width")
    private Integer width;
    
    @Column(name = "height")
    private Integer height;
    
    @PrePersist
    public void prePersist() {
        if (uploadDate == null) {
            uploadDate = LocalDateTime.now();
        }
        if (isActive == null) {
            isActive = true;
        }
    }
    
    // Convenience methods
    public String getFileUrl() {
        return "/api/images/" + id;
    }
    
    public boolean isImage() {
        return contentType != null && contentType.startsWith("image/");
    }
    
    // Enum for common image types (for type safety)
    public enum ImageType {
        PASSPORT("PASSPORT"),
        PROFILE("PROFILE"),
        ID_CARD("ID_CARD"),
        SIGNATURE("SIGNATURE"),
        DOCUMENT("DOCUMENT"),
        LOAN_DOCUMENT("LOAN_DOCUMENT"),
        GUARANTOR_PHOTO("GUARANTOR_PHOTO"),
        NEXT_OF_KIN_PHOTO("NEXT_OF_KIN_PHOTO");
        
        private final String value;
        
        ImageType(String value) {
            this.value = value;
        }
        
        public String getValue() {
            return value;
        }
    }
    
    // Enum for entity types
    public enum EntityType {
        CLIENT("CLIENT"),
        LOAN_OFFICER("LOAN_OFFICER"),
        USER("USER"),
        LOAN("LOAN"),
        DOCUMENT("DOCUMENT"),
        GUARANTOR("GUARANTOR"),
        NEXT_OF_KIN("NEXT_OF_KIN");
        
        private final String value;
        
        EntityType(String value) {
            this.value = value;
        }
        
        public String getValue() {
            return value;
        }
    }
    
    // Enum for image categories
    public enum ImageCategory {
        PERSONAL("PERSONAL"),
        DOCUMENT("DOCUMENT"),
        VERIFICATION("VERIFICATION"),
        SYSTEM("SYSTEM");
        
        private final String value;
        
        ImageCategory(String value) {
            this.value = value;
        }
        
        public String getValue() {
            return value;
        }
    }
}