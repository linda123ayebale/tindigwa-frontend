package org.example.Services;

import org.example.config.FileUploadConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.UUID;

@Service
public class FileUploadService {

    @Autowired
    private FileUploadConfig fileUploadConfig;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    public String uploadReceipt(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Validate file type
        if (!isValidFileType(file.getContentType())) {
            throw new IllegalArgumentException("Invalid file type. Only JPEG, PNG, GIF, and PDF files are allowed.");
        }

        // Validate file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum allowed size of 10MB");
        }

        // Create upload directory if it doesn't exist
        Path uploadDir = Paths.get(fileUploadConfig.getReceiptsDirectory());
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".") 
            ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
            : "";
        
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uniqueFilename = "receipt_" + timestamp + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;

        // Save file
        Path filePath = uploadDir.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return uniqueFilename;
    }

    public void deleteReceipt(String filename) throws IOException {
        if (filename == null || filename.isEmpty()) {
            return;
        }

        Path filePath = Paths.get(fileUploadConfig.getReceiptsDirectory()).resolve(filename);
        if (Files.exists(filePath)) {
            Files.delete(filePath);
        }
    }

    public byte[] getReceiptFile(String filename) throws IOException {
        if (filename == null || filename.isEmpty()) {
            throw new IllegalArgumentException("Filename cannot be null or empty");
        }

        Path filePath = Paths.get(fileUploadConfig.getReceiptsDirectory()).resolve(filename);
        if (!Files.exists(filePath)) {
            throw new IllegalArgumentException("File not found: " + filename);
        }

        return Files.readAllBytes(filePath);
    }

    public String getReceiptContentType(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "application/octet-stream";
        }

        String extension = filename.toLowerCase();
        if (extension.endsWith(".jpg") || extension.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (extension.endsWith(".png")) {
            return "image/png";
        } else if (extension.endsWith(".gif")) {
            return "image/gif";
        } else if (extension.endsWith(".pdf")) {
            return "application/pdf";
        }
        
        return "application/octet-stream";
    }

    private boolean isValidFileType(String contentType) {
        if (contentType == null) {
            return false;
        }

        return Arrays.asList(fileUploadConfig.getAllowedTypes()).contains(contentType);
    }

    public long getFileSize(String filename) throws IOException {
        if (filename == null || filename.isEmpty()) {
            return 0;
        }

        Path filePath = Paths.get(fileUploadConfig.getReceiptsDirectory()).resolve(filename);
        if (!Files.exists(filePath)) {
            return 0;
        }

        return Files.size(filePath);
    }
}