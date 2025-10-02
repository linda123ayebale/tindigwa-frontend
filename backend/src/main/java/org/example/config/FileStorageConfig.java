package org.example.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "file")
public class FileStorageConfig {
    
    private String uploadDir = "./uploads";
    private long maxFileSize = 5242880; // 5MB in bytes
    private String[] allowedExtensions = {"jpg", "jpeg", "png", "gif"};
    private String servePath = "/api/images";
    
    // Subdirectories for different types of images
    private String clientPhotosDir = "client-photos";
    private String loanOfficerPhotosDir = "loan-officer-photos";
    private String documentsDir = "documents";
    private String signaturesDir = "signatures";
    
    // Getters and Setters
    public String getUploadDir() {
        return uploadDir;
    }
    
    public void setUploadDir(String uploadDir) {
        this.uploadDir = uploadDir;
    }
    
    public long getMaxFileSize() {
        return maxFileSize;
    }
    
    public void setMaxFileSize(long maxFileSize) {
        this.maxFileSize = maxFileSize;
    }
    
    public String[] getAllowedExtensions() {
        return allowedExtensions;
    }
    
    public void setAllowedExtensions(String[] allowedExtensions) {
        this.allowedExtensions = allowedExtensions;
    }
    
    public String getServePath() {
        return servePath;
    }
    
    public void setServePath(String servePath) {
        this.servePath = servePath;
    }
    
    public String getClientPhotosDir() {
        return clientPhotosDir;
    }
    
    public void setClientPhotosDir(String clientPhotosDir) {
        this.clientPhotosDir = clientPhotosDir;
    }
    
    public String getLoanOfficerPhotosDir() {
        return loanOfficerPhotosDir;
    }
    
    public void setLoanOfficerPhotosDir(String loanOfficerPhotosDir) {
        this.loanOfficerPhotosDir = loanOfficerPhotosDir;
    }
    
    public String getDocumentsDir() {
        return documentsDir;
    }
    
    public void setDocumentsDir(String documentsDir) {
        this.documentsDir = documentsDir;
    }
    
    public String getSignaturesDir() {
        return signaturesDir;
    }
    
    public void setSignaturesDir(String signaturesDir) {
        this.signaturesDir = signaturesDir;
    }
    
    // Helper methods
    public String getFullUploadPath(String subDirectory) {
        return uploadDir + "/" + subDirectory;
    }
    
    public boolean isValidExtension(String extension) {
        for (String allowed : allowedExtensions) {
            if (allowed.equalsIgnoreCase(extension)) {
                return true;
            }
        }
        return false;
    }
    
    public boolean isValidFileSize(long fileSize) {
        return fileSize <= maxFileSize;
    }
}