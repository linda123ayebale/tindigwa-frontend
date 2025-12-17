package org.example.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.Entities.Person;

@Entity
@Table(name = "guarantors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Guarantor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "person_id", referencedColumnName = "id")
    private Person person;
    
    // Relationship to the client (Parent, Spouse, etc.)
    private String relationship;
}
