package org.example.Repositories;

import org.example.DTO.ClientDetailsDTO;
import org.example.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByIsSetupUser(boolean isSetupUser);

        // Example 1: Get user by username
        Optional<User> findByUsername(String username);

        // Example 2: Count users by role
        @Query("SELECT u.role, COUNT(u) FROM User u GROUP BY u.role")
        List<Object[]> countUsersByRole();
        
        // Add method to count total users (for first-user logic)
        @Query("SELECT COUNT(u) FROM User u")
        long countTotalUsers();
        
        // Find by role enum
        List<User> findByRole(User.UserRole role);

        // Example 3: Get all clients with guarantors (JPQL with joins)
        @Query("""
           SELECT u 
           FROM User u
           LEFT JOIN FETCH u.guarantor g
           LEFT JOIN FETCH g.person gp
           JOIN FETCH u.person p
           WHERE u.role = org.example.Entities.User$UserRole.CLIENT
           """)
        List<User> findAllClientsWithGuarantors();

        // Example 4: Get all loan officers with next of kin
        @Query("""
           SELECT u 
           FROM User u
           LEFT JOIN FETCH u.nextOfKin n
           LEFT JOIN FETCH n.person np
           JOIN FETCH u.person p
           WHERE u.role = org.example.Entities.User$UserRole.LOAN_OFFICER
           """)
        List<User> findAllLoanOfficersWithNextOfKin();

        // Example 5: Get all admins
        @Query("""
           SELECT u 
           FROM User u
           JOIN FETCH u.person p
           WHERE u.role = org.example.Entities.User$UserRole.ADMIN
           """)
        List<User> findAllAdmins();

    @Query(value = """
        SELECT 
            p.first_name AS firstName,
            p.given_name AS givenName,
            p.last_name AS lastName,
            p.national_id AS nationalId,
            p.contact AS contact,
            p.district AS district,
            p.village AS village,
            p.parish AS parish,
            u.username AS loanOfficer,
            CONCAT(gp.first_name, ' ', gp.last_name) AS guarantorName,
            CONCAT(nkp.first_name, ' ', nkp.last_name) AS nextOfKinName,
            c.status AS status
        FROM clients c
        JOIN person p ON c.person_id = p.person_id
        JOIN users u ON c.loan_officer_id = u.user_id
        LEFT JOIN guarantor g ON g.client_id = c.client_id
        LEFT JOIN person gp ON g.person_id = gp.person_id
        LEFT JOIN next_of_kin nk ON nk.client_id = c.client_id
        LEFT JOIN person nkp ON nk.person_id = nkp.person_id
        """, nativeQuery = true)
    List<User> findAllClientDetails();
    }


