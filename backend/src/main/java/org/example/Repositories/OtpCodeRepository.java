package org.example.Repositories;

import org.example.Entities.OtpCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OtpCodeRepository extends JpaRepository<OtpCode, Long> {
    
    /**
     * Find the most recent valid OTP for a user and purpose
     */
    @Query("SELECT o FROM OtpCode o WHERE o.userId = :userId AND o.purpose = :purpose " +
           "AND o.isUsed = false AND o.expiresAt > :now " +
           "ORDER BY o.createdAt DESC")
    Optional<OtpCode> findLatestValidOtp(
        @Param("userId") Long userId, 
        @Param("purpose") String purpose,
        @Param("now") LocalDateTime now
    );
    
    /**
     * Find all OTPs for a user and purpose (used for cleanup and checking)
     */
    List<OtpCode> findByUserIdAndPurpose(Long userId, String purpose);
    
    /**
     * Find all OTPs for a user
     */
    List<OtpCode> findByUserId(Long userId);
    
    /**
     * Delete expired OTPs (cleanup task)
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM OtpCode o WHERE o.expiresAt < :now")
    void deleteExpiredOtps(@Param("now") LocalDateTime now);
    
    /**
     * Delete used OTPs older than specified time (cleanup task)
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM OtpCode o WHERE o.isUsed = true AND o.createdAt < :cutoffTime")
    void deleteUsedOtpsOlderThan(@Param("cutoffTime") LocalDateTime cutoffTime);
    
    /**
     * Mark all OTPs for a user as used (when generating a new one)
     */
    @Modifying
    @Transactional
    @Query("UPDATE OtpCode o SET o.isUsed = true WHERE o.userId = :userId AND o.purpose = :purpose AND o.isUsed = false")
    void invalidateUserOtps(@Param("userId") Long userId, @Param("purpose") String purpose);
    
    /**
     * Count active OTPs for a user and purpose
     */
    @Query("SELECT COUNT(o) FROM OtpCode o WHERE o.userId = :userId AND o.purpose = :purpose " +
           "AND o.isUsed = false AND o.expiresAt > :now")
    long countActiveOtps(
        @Param("userId") Long userId,
        @Param("purpose") String purpose,
        @Param("now") LocalDateTime now
    );
}
