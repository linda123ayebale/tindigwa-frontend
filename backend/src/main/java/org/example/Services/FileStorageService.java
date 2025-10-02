package org.example.Services;

import org.example.config.FileStorageConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Objects;
import java.util.UUID;

@Service
public class FileStorageService {
    
    @Autowired
    private FileStorageConfig fileStorageConfig;
    
    private Path fileStorageLocation;
    
    @PostConstruct
    public void init() {
        this.fileStorageLocation = Paths.get(fileStorageConfig.getUploadDir())
                .toAbsolutePath().normalize();
        
        try {
            Files.createDirectories(this.fileStorageLocation);
            
            // Create subdirectories
            createSubDirectory(fileStorageConfig.getClientPhotosDir());
            createSubDirectory(fileStorageConfig.getLoanOfficerPhotosDir());
            createSubDirectory(fileStorageConfig.getDocumentsDir());
            createSubDirectory(fileStorageConfig.getSignaturesDir());
            
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }
    
    private void createSubDirectory(String subDir) throws IOException {
        Path subDirPath = this.fileStorageLocation.resolve(subDir);
        Files.createDirectories(subDirPath);
    }
    
    /**
     * Store a file in the specified category directory
     */
    public String storeFile(MultipartFile file, String category, String entityType, Long entityId) {
        // Validate file
        validateFile(file);
        
        // Generate unique filename
        String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String storedFilename = generateUniqueFilename(originalFilename, entityType, entityId);
        
        try {
            // Check if the file's name contains invalid characters
            if (originalFilename.contains("..")) {
                throw new RuntimeException("Sorry! Filename contains invalid path sequence " + originalFilename);
            }
            
            // Determine target location
            Path categoryPath = this.fileStorageLocation.resolve(category);
            Files.createDirectories(categoryPath); // Ensure directory exists
            
            Path targetLocation = categoryPath.resolve(storedFilename);
            
            // Copy file to the target location (replacing existing file with the same name)
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            return category + "/" + storedFilename;
            
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + originalFilename + ". Please try again!", ex);
        }
    }
    
    /**
     * Load file as a Resource for serving
     */
    public Resource loadFileAsResource(String filePath) {
        try {
            Path file = this.fileStorageLocation.resolve(filePath).normalize();
            Resource resource = new UrlResource(file.toUri());
            
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("File not found " + filePath);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found " + filePath, ex);
        }
    }
    
    /**
     * Delete a file
     */
    public boolean deleteFile(String filePath) {
        try {
            Path file = this.fileStorageLocation.resolve(filePath).normalize();
            return Files.deleteIfExists(file);
        } catch (IOException ex) {
            throw new RuntimeException("Could not delete file " + filePath, ex);
        }
    }
    
    /**
     * Generate unique filename with timestamp and UUID
     */
    public String generateUniqueFilename(String originalFilename, String entityType, Long entityId) {
        String extension = getFileExtension(originalFilename);
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        
        return String.format("%s_%s_%s_%s.%s", 
                entityType.toLowerCase(), 
                entityId, 
                timestamp, 
                uuid, 
                extension);
    }
    
    /**
     * Validate uploaded file
     */
    public void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("Failed to store empty file.");
        }
        
        // Check file size
        if (!fileStorageConfig.isValidFileSize(file.getSize())) {
            throw new RuntimeException("File size exceeds maximum allowed size of " + 
                    fileStorageConfig.getMaxFileSize() + " bytes.");
        }
        
        // Check file extension
        String filename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String extension = getFileExtension(filename);
        
        if (!fileStorageConfig.isValidExtension(extension)) {
            throw new RuntimeException("File type not allowed. Allowed types: " + 
                    String.join(", ", fileStorageConfig.getAllowedExtensions()));
        }
    }
    
    /**
     * Get file extension from filename
     */
    public String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex > 0 && lastDotIndex < filename.length() - 1) {
            return filename.substring(lastDotIndex + 1).toLowerCase();
        }
        return "";
    }
    
    /**
     * Get content type from filename
     */
    public String getContentType(String filename) {
        String extension = getFileExtension(filename);
        return switch (extension.toLowerCase()) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            default -> "application/octet-stream";
        };
    }
    
    /**
     * Check if file exists
     */
    public boolean fileExists(String filePath) {
        try {
            Path file = this.fileStorageLocation.resolve(filePath).normalize();
            return Files.exists(file);
        } catch (Exception ex) {
            return false;
        }
    }
    
    /**
     * Get file size
     */
    public long getFileSize(String filePath) {
        try {
            Path file = this.fileStorageLocation.resolve(filePath).normalize();
            return Files.size(file);
        } catch (IOException ex) {
            return 0;
        }
    }
    
    /**
     * Get storage directory for entity type
     */
    public String getStorageDirectory(String entityType, String imageType) {
        return switch (entityType.toLowerCase()) {
            case "client" -> fileStorageConfig.getClientPhotosDir();
            case "loan_officer", "loan-officer" -> fileStorageConfig.getLoanOfficerPhotosDir();
            case "document" -> fileStorageConfig.getDocumentsDir();
            case "signature" -> fileStorageConfig.getSignaturesDir();
            default -> "misc";
        };
    }
}