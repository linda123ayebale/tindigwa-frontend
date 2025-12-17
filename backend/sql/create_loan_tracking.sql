-- =====================================================
-- LOAN TRACKING SYSTEM - DATABASE MIGRATION
-- =====================================================
-- This script creates the loan_tracking table and triggers
-- for automatic loan state management
-- =====================================================

USE tindigwa;

-- Drop triggers if they exist (for re-running)
DROP TRIGGER IF EXISTS after_loan_insert_tracking;
DROP TRIGGER IF EXISTS after_payment_insert_tracking;

-- Drop table if exists (for re-running)
DROP TABLE IF EXISTS loan_tracking;

-- =====================================================
-- CREATE LOAN_TRACKING TABLE
-- =====================================================
CREATE TABLE loan_tracking (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    -- Loan Reference
    loan_id BIGINT NOT NULL UNIQUE,
    loan_number VARCHAR(255),
    client_id BIGINT NOT NULL,
    
    -- Original Loan Amounts
    original_principal DOUBLE NOT NULL,
    original_interest DOUBLE,
    processing_fee DOUBLE,
    total_due DOUBLE NOT NULL,
    
    -- Cumulative Payment Tracking
    cumulative_payment DOUBLE DEFAULT 0.0,
    cumulative_principal_paid DOUBLE DEFAULT 0.0,
    cumulative_interest_paid DOUBLE DEFAULT 0.0,
    cumulative_fees_paid DOUBLE DEFAULT 0.0,
    cumulative_penalty DOUBLE DEFAULT 0.0,
    cumulative_penalty_paid DOUBLE DEFAULT 0.0,
    
    -- Outstanding Balances
    outstanding_balance DOUBLE NOT NULL,
    outstanding_principal DOUBLE,
    outstanding_interest DOUBLE,
    outstanding_fees DOUBLE,
    outstanding_penalty DOUBLE,
    
    -- Payment Schedule & Status
    expected_payment_amount DOUBLE,
    payment_frequency VARCHAR(50),
    total_installments INT,
    installments_paid INT DEFAULT 0,
    installments_remaining INT,
    next_payment_due_date DATE,
    last_payment_date DATE,
    last_payment_amount DOUBLE,
    
    -- Late Payment Tracking
    is_late BOOLEAN DEFAULT FALSE,
    days_late INT DEFAULT 0,
    months_overdue INT DEFAULT 0,
    late_payment_count INT DEFAULT 0,
    missed_payment_count INT DEFAULT 0,
    grace_period_days INT,
    fine_trigger_date DATE,
    
    -- Payment Characteristics
    payment_status VARCHAR(50) DEFAULT 'ON_TIME',
    payment_pattern VARCHAR(50),
    payment_behavior_score DOUBLE,
    has_partial_payments BOOLEAN DEFAULT FALSE,
    has_overpayments BOOLEAN DEFAULT FALSE,
    early_payment_count INT DEFAULT 0,
    on_time_payment_count INT DEFAULT 0,
    
    -- Financial Metrics
    payment_to_principal_ratio DOUBLE,
    interest_coverage_ratio DOUBLE,
    default_risk_score DOUBLE,
    profitability_index DOUBLE,
    recovery_rate DOUBLE,
    expected_profit DOUBLE,
    actual_profit DOUBLE,
    expected_vs_actual_variance DOUBLE,
    
    -- Loan Dates
    loan_release_date DATE,
    loan_maturity_date DATE,
    expected_completion_date DATE,
    actual_completion_date DATE,
    
    -- Loan Status
    loan_status VARCHAR(50) DEFAULT 'ACTIVE',
    completion_percentage DOUBLE,
    is_current BOOLEAN DEFAULT TRUE,
    is_defaulted BOOLEAN DEFAULT FALSE,
    default_date DATE,
    
    -- System Fields
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    last_calculated_at DATETIME,
    
    -- Foreign Keys
    FOREIGN KEY (loan_id) REFERENCES loan_details(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_loan_id (loan_id),
    INDEX idx_client_id (client_id),
    INDEX idx_loan_status (loan_status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_is_late (is_late),
    INDEX idx_next_payment_due (next_payment_due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- TRIGGER: Initialize tracking after loan creation
-- =====================================================
DELIMITER $$

CREATE TRIGGER after_loan_insert_tracking
AFTER INSERT ON loan_details
FOR EACH ROW
BEGIN
    DECLARE interest_amount DOUBLE;
    
    -- Calculate interest amount
    SET interest_amount = NEW.total_payable - NEW.principal_amount - NEW.processing_fee;
    
    -- Insert initial tracking record
    INSERT INTO loan_tracking (
        loan_id,
        loan_number,
        client_id,
        original_principal,
        original_interest,
        processing_fee,
        total_due,
        outstanding_balance,
        outstanding_principal,
        outstanding_interest,
        outstanding_fees,
        outstanding_penalty,
        payment_frequency,
        total_installments,
        installments_remaining,
        expected_payment_amount,
        next_payment_due_date,
        loan_release_date,
        loan_maturity_date,
        grace_period_days,
        fine_trigger_date,
        loan_status,
        completion_percentage,
        created_at,
        updated_at,
        last_calculated_at
    ) VALUES (
        NEW.id,
        NEW.loan_number,
        NEW.client_id,
        NEW.principal_amount,
        interest_amount,
        NEW.processing_fee,
        NEW.total_payable,
        NEW.total_payable,
        NEW.principal_amount,
        interest_amount,
        NEW.processing_fee,
        0.0,
        NEW.repayment_frequency,
        NEW.number_of_repayments,
        NEW.number_of_repayments,
        NEW.total_payable / NULLIF(NEW.number_of_repayments, 0),
        COALESCE(NEW.first_repayment_date, NEW.payment_start_date),
        NEW.release_date,
        NEW.payment_end_date,
        NEW.grace_period_days,
        DATE_ADD(COALESCE(NEW.first_repayment_date, NEW.payment_start_date), INTERVAL NEW.grace_period_days DAY),
        'ACTIVE',
        0.0,
        NOW(),
        NOW(),
        NOW()
    );
END$$

DELIMITER ;

-- =====================================================
-- SUMMARY
-- =====================================================
-- Created:
-- 1. loan_tracking table with comprehensive tracking fields
-- 2. after_loan_insert_tracking trigger for automatic initialization
-- 
-- Note: Payment tracking updates are handled by the Spring application layer
-- via the LoanTrackingService and event listeners for better flexibility
-- and complex business logic handling.
-- =====================================================

SELECT 'Loan tracking table and triggers created successfully!' AS Status;
