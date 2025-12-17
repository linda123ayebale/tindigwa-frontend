package org.example.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "sequences", uniqueConstraints = {
    @UniqueConstraint(name = "uk_sequences", columnNames = {"module_prefix", "branch_code", "year_code"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Sequence {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "module_prefix", nullable = false, length = 10)
    private String modulePrefix;  // LN, PM, EX, US, BR, VN, etc.
    
    @Column(name = "branch_code", nullable = false, length = 10)
    private String branchCode;     // Year in YY format (e.g., "25" for 2025)
    
    @Column(name = "year_code", nullable = false, length = 6)
    private String yearMonth;      // Year in YY format (e.g., "25" for 2025) - field named yearMonth for Java convention
    
    @Column(name = "last_number", nullable = false)
    private Integer lastNumber;    // Last sequence number used
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.lastNumber == null) {
            this.lastNumber = 0;
        }
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
