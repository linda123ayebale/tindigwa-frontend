package org.example.Entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class OperationalExpenses {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    String expenseType;
    double amount;
    LocalDate expenseDate;
    String description;

}
