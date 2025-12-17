package org.example.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "expense_logs")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ExpenseLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "expense_id", nullable = false)
    private Long expenseId;
    
    @Column(name = "action", nullable = false, length = 50)
    private String action; // CREATED, APPROVED, REJECTED, PAID
    
    @Column(name = "action_by")
    private String actionBy;
    
    @Column(name = "action_at", nullable = false)
    private LocalDateTime actionAt;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @PrePersist
    protected void onCreate() {
        if (actionAt == null) {
            actionAt = LocalDateTime.now();
        }
    }
}
