-- ============================================================================
-- Complete Sample Data Population for Tindigwa Loan Management System
-- This script creates a full dataset to test the enhanced /api/loans/complete endpoint
-- ============================================================================

USE tindigwa;

-- Clean up existing test data (optional - comment out if you want to keep existing data)
-- DELETE FROM loan_workflow_logs WHERE loan_id >= 1001;
-- DELETE FROM loan_tracking WHERE loan_id >= 1001;
-- DELETE FROM loan_payments WHERE loan_id >= 1001;
-- DELETE FROM loan_details WHERE id >= 1001;
-- DELETE FROM users WHERE id >= 100;
-- DELETE FROM persons WHERE id >= 100;

-- ============================================================================
-- STEP 1: Insert Persons (Complete with all details)
-- ============================================================================

INSERT INTO persons (id, first_name, given_name, last_name, gender, age, contact, national_id, village, parish, district, occupation, employment_status, monthly_income)
VALUES
-- Client
(100, 'Annah Felix', 'Grace', 'Ayebale', 'FEMALE', 32, '0700112233', 'CM89012345678', 'Kiwatule', 'Ntinda', 'Kampala', 'Teacher', 'Employed', '1200000'),

-- Loan Officer  
(101, 'Mulongo', 'Kenneth', 'Micheal', 'MALE', 35, '0778347588', 'CM89098765432', 'Nakibembe', 'Busiu', 'Mbale', 'Loan Officer', 'Employed', '1500000'),

-- Guarantor
(102, 'Peter', 'James', 'Guarantor', 'MALE', 45, '0788999000', 'CM89012398765', 'Wairaka', 'Bugembe', 'Jinja', 'Business Owner', 'Self-Employed', '2000000'),

-- Next of Kin
(103, 'Mary', 'Elizabeth', 'Kin', 'FEMALE', 28, '0700887766', 'CM89012387654', 'Busembatia', 'Namutumba', 'Iganga', 'Nurse', 'Employed', '1000000'),

-- Additional Loan Officer (for variety)
(104, 'Sarah', 'Jane', 'Namukasa', 'FEMALE', 30, '0701234567', 'CM89012345679', 'Wandegeya', 'Kawempe', 'Kampala', 'Loan Officer', 'Employed', '1400000'),

-- Additional Client
(105, 'John', 'Paul', 'Okello', 'MALE', 40, '0789123456', 'CM89012345680', 'Nakasero', 'Central', 'Kampala', 'Engineer', 'Employed', '2500000');

-- ============================================================================
-- STEP 2: Insert Users (Linked to Persons)
-- ============================================================================

INSERT INTO users (id, user_code, username, email, password, role, person_id, branch, created_at, is_setup_user)
VALUES
-- Client User
(100, 'US250100', 'annahayebale', 'felix@example.com', '$2a$10$encrypted.password.hash', 'CLIENT', 100, 'Main Branch - Kampala', '2025-01-10 08:00:00', false),

-- Loan Officer Users
(101, 'US250101', 'mulongo', 'mulongo@gmail.com', '$2a$10$encrypted.password.hash', 'LOAN_OFFICER', 101, 'Main Branch - Kampala', '2025-01-05 09:00:00', false),

(102, 'US250102', 'sarahnamukasa', 'sarah@example.com', '$2a$10$encrypted.password.hash', 'LOAN_OFFICER', 104, 'Main Branch - Kampala', '2025-01-05 09:00:00', false),

-- Additional Client
(103, 'US250103', 'johnokello', 'john@example.com', '$2a$10$encrypted.password.hash', 'CLIENT', 105, 'Main Branch - Kampala', '2025-01-15 10:00:00', false),

-- Cashier (for approvals)
(104, 'US250104', 'cashier1', 'cashier@example.com', '$2a$10$encrypted.password.hash', 'CASHIER', 101, 'Main Branch - Kampala', '2025-01-01 08:00:00', false);

-- ============================================================================
-- STEP 3: Insert Guarantors and Next of Kin (Standalone entities)
-- ============================================================================

INSERT INTO guarantors (id, person_id, relationship)
VALUES
(100, 102, 'Business Partner'),
(101, 102, 'Family Friend');

INSERT INTO next_of_kin (id, person_id)
VALUES
(100, 103),
(101, 103);

-- ============================================================================
-- STEP 4: Link Guarantors and Next of Kin to Client Users
-- ============================================================================

UPDATE users SET guarantor_id = 100, next_of_kin_id = 100 WHERE id = 100;
UPDATE users SET guarantor_id = 101, next_of_kin_id = 101 WHERE id = 103;

-- ============================================================================
-- STEP 5: Insert Loan Details (Multiple Scenarios)
-- ============================================================================

-- Loan 1: REJECTED Loan (for testing rejected state)
INSERT INTO loan_details (
    id, loan_number, client_id, product_id, loan_title, description,
    principal_amount, interest_rate, interest_method, interest_type, rate_per,
    loan_duration, duration_unit, loan_duration_days,
    repayment_frequency, number_of_repayments, grace_period_days,
    release_date, payment_start_date, payment_end_date, first_repayment_date,
    processing_fee, late_fee, default_fee, total_payable,
    loan_status, lending_branch, agreement_signed,
    created_at, updated_at, created_by_id, created_by,
    workflow_status, rejected_by_id, rejection_reason, approval_date
)
VALUES (
    1001, 'LN250001', 100, 1, 'Business Expansion Loan', 'Loan for expanding tailoring business',
    500000, 18.0, 'flat', 'percentage', 'year',
    6, 'months', 180,
    'monthly', 6, 7,
    '2025-10-20', '2025-10-27', '2026-04-27', '2025-11-27',
    25000, 10000, 50000, 590000,
    'CLOSED', 'Main Branch - Kampala', true,
    '2025-10-14 10:47:00', '2025-10-19 15:30:00', 101, 'Mulongo Micheal',
    'REJECTED', 104, 'E2E Test Rejection - Insufficient collateral', '2025-10-19 15:30:00'
);

-- Loan 2: DISBURSED Loan (Active with payments)
INSERT INTO loan_details (
    id, loan_number, client_id, product_id, loan_title, description,
    principal_amount, interest_rate, interest_method, interest_type, rate_per,
    loan_duration, duration_unit, loan_duration_days,
    repayment_frequency, number_of_repayments, grace_period_days,
    release_date, payment_start_date, payment_end_date, first_repayment_date,
    processing_fee, late_fee, default_fee, total_payable,
    loan_status, lending_branch, agreement_signed,
    created_at, updated_at, created_by_id, created_by,
    workflow_status, approved_by_id, approval_date, disbursed_at, disbursed_by
)
VALUES (
    1002, 'LN250002', 100, 1, 'Home Renovation Loan', 'Loan for home improvements',
    1000000, 15.0, 'flat', 'percentage', 'year',
    12, 'months', 365,
    'monthly', 12, 7,
    '2025-09-15', '2025-09-22', '2026-09-22', '2025-10-22',
    50000, 15000, 75000, 1150000,
    'IN_PROGRESS', 'Main Branch - Kampala', true,
    '2025-09-10 09:00:00', '2025-09-15 14:00:00', 102, 'Sarah Namukasa',
    'DISBURSED', 104, '2025-09-12 11:00:00', '2025-09-15 14:00:00', 'Cash'
);

-- Loan 3: APPROVED Loan (Awaiting disbursement)
INSERT INTO loan_details (
    id, loan_number, client_id, product_id, loan_title, description,
    principal_amount, interest_rate, interest_method, interest_type, rate_per,
    loan_duration, duration_unit, loan_duration_days,
    repayment_frequency, number_of_repayments, grace_period_days,
    release_date, payment_start_date, payment_end_date, first_repayment_date,
    processing_fee, late_fee, default_fee, total_payable,
    loan_status, lending_branch, agreement_signed,
    created_at, updated_at, created_by_id, created_by,
    workflow_status, approved_by_id, approval_date
)
VALUES (
    1003, 'LN250003', 103, 1, 'Agricultural Loan', 'Loan for purchasing farming equipment',
    750000, 12.0, 'flat', 'percentage', 'year',
    9, 'months', 270,
    'monthly', 9, 7,
    '2025-11-01', '2025-11-08', '2026-08-08', '2025-12-08',
    35000, 12000, 60000, 840000,
    'OPEN', 'Main Branch - Kampala', true,
    '2025-10-25 10:00:00', '2025-10-28 16:00:00', 101, 'Mulongo Micheal',
    'APPROVED', 104, '2025-10-28 16:00:00'
);

-- Loan 4: PENDING_APPROVAL Loan
INSERT INTO loan_details (
    id, loan_number, client_id, product_id, loan_title, description,
    principal_amount, interest_rate, interest_method, interest_type, rate_per,
    loan_duration, duration_unit, loan_duration_days,
    repayment_frequency, number_of_repayments, grace_period_days,
    release_date, payment_start_date, payment_end_date, first_repayment_date,
    processing_fee, late_fee, default_fee, total_payable,
    loan_status, lending_branch, agreement_signed,
    created_at, updated_at, created_by_id, created_by,
    workflow_status
)
VALUES (
    1004, 'LN250004', 103, 1, 'Education Loan', 'Loan for school fees',
    300000, 10.0, 'flat', 'percentage', 'year',
    6, 'months', 180,
    'monthly', 6, 0,
    '2025-11-15', '2025-11-15', '2026-05-15', '2025-12-15',
    15000, 8000, 40000, 330000,
    'OPEN', 'Main Branch - Kampala', false,
    '2025-11-10 14:30:00', '2025-11-10 14:30:00', 102, 'Sarah Namukasa',
    'PENDING_APPROVAL'
);

-- ============================================================================
-- STEP 6: Insert Loan Tracking Records
-- ============================================================================

-- Tracking for Loan 1002 (DISBURSED - with some payments)
INSERT INTO loan_tracking (
    loan_id, outstanding_balance, amount_paid, installments_paid, total_installments,
    next_payment_date, next_payment_amount, last_payment_date, penalty,
    status, created_at, updated_at
)
VALUES (
    1002, 1053333.33, 96666.67, 1, 12,
    '2025-11-22', 95833.33, '2025-10-22', 0,
    'CURRENT', '2025-09-15 14:00:00', '2025-10-22 10:00:00'
);

-- Tracking for Loan 1003 (APPROVED - not yet disbursed)
INSERT INTO loan_tracking (
    loan_id, outstanding_balance, amount_paid, installments_paid, total_installments,
    next_payment_date, next_payment_amount, last_payment_date, penalty,
    status, created_at, updated_at
)
VALUES (
    1003, 840000, 0, 0, 9,
    NULL, 93333.33, NULL, 0,
    'PENDING', '2025-10-28 16:00:00', '2025-10-28 16:00:00'
);

-- ============================================================================
-- STEP 7: Insert Loan Payments (for Loan 1002)
-- ============================================================================

INSERT INTO loan_payments (
    loan_id, payment_number, payment_date, amount_paid, payment_method, reference_number,
    notes, installment_number, scheduled_amount, principal_paid, interest_paid, fees_paid,
    cumulative_payment, outstanding_balance, principal_balance, interest_balance,
    late, days_late, grace_period_days, fine, cumulative_penalty,
    created_at, updated_at, created_by, payment_status
)
VALUES (
    1002, 'PM250001', '2025-10-22', 96666.67, 'Bank Transfer', 'REF20251022001',
    'First installment payment', 1, 95833.33, 83333.33, 12500.00, 4166.67,
    96666.67, 1053333.33, 916666.67, 137500.00,
    false, 0, 7, 0, 0,
    '2025-10-22 10:15:00', '2025-10-22 10:15:00', 100, 'COMPLETED'
);

-- ============================================================================
-- STEP 8: Insert Workflow History (Complete lifecycle events)
-- ============================================================================

-- Workflow for Loan 1001 (REJECTED)
INSERT INTO loan_workflow_logs (loan_id, action, performed_by_id, performed_by, notes, created_at)
VALUES
(1001, 'CREATED', 101, 'Mulongo Micheal', 'Loan application created by loan officer', '2025-10-14 10:47:00'),
(1001, 'SUBMITTED', 101, 'Mulongo Micheal', 'Loan application submitted for approval', '2025-10-14 11:00:00'),
(1001, 'REJECTED', 104, 'Cashier User', 'E2E Test Rejection - Insufficient collateral', '2025-10-19 15:30:00');

-- Workflow for Loan 1002 (DISBURSED)
INSERT INTO loan_workflow_logs (loan_id, action, performed_by_id, performed_by, notes, created_at)
VALUES
(1002, 'CREATED', 102, 'Sarah Namukasa', 'Loan application created', '2025-09-10 09:00:00'),
(1002, 'SUBMITTED', 102, 'Sarah Namukasa', 'Application submitted for review', '2025-09-10 09:30:00'),
(1002, 'APPROVED', 104, 'Cashier User', 'Loan approved after verification', '2025-09-12 11:00:00'),
(1002, 'DISBURSED', 104, 'Cashier User', 'Loan amount disbursed via cash', '2025-09-15 14:00:00'),
(1002, 'PAYMENT_RECEIVED', 100, 'Annah Felix Ayebale', 'First installment payment received', '2025-10-22 10:15:00');

-- Workflow for Loan 1003 (APPROVED)
INSERT INTO loan_workflow_logs (loan_id, action, performed_by_id, performed_by, notes, created_at)
VALUES
(1003, 'CREATED', 101, 'Mulongo Micheal', 'Agricultural loan application created', '2025-10-25 10:00:00'),
(1003, 'SUBMITTED', 101, 'Mulongo Micheal', 'Submitted for cashier approval', '2025-10-25 10:30:00'),
(1003, 'APPROVED', 104, 'Cashier User', 'Approved - awaiting disbursement', '2025-10-28 16:00:00');

-- Workflow for Loan 1004 (PENDING_APPROVAL)
INSERT INTO loan_workflow_logs (loan_id, action, performed_by_id, performed_by, notes, created_at)
VALUES
(1004, 'CREATED', 102, 'Sarah Namukasa', 'Education loan application created', '2025-11-10 14:30:00'),
(1004, 'SUBMITTED', 102, 'Sarah Namukasa', 'Awaiting cashier review', '2025-11-10 14:45:00');

-- ============================================================================
-- VERIFICATION QUERIES (Run these to confirm data is inserted correctly)
-- ============================================================================

-- Check Persons
SELECT 'PERSONS:' as section, COUNT(*) as count FROM persons WHERE id >= 100;

-- Check Users
SELECT 'USERS:' as section, COUNT(*) as count FROM users WHERE id >= 100;

-- Check Loans
SELECT 'LOANS:' as section, COUNT(*) as count FROM loan_details WHERE id >= 1001;

-- Check Tracking
SELECT 'TRACKING:' as section, COUNT(*) as count FROM loan_tracking WHERE loan_id >= 1001;

-- Check Payments
SELECT 'PAYMENTS:' as section, COUNT(*) as count FROM loan_payments WHERE loan_id >= 1001;

-- Check Workflow Logs
SELECT 'WORKFLOW:' as section, COUNT(*) as count FROM loan_workflow_logs WHERE loan_id >= 1001;

-- Display summary of created loans
SELECT 
    id,
    loan_number,
    workflow_status,
    loan_status,
    principal_amount,
    created_by as officer_name
FROM loan_details 
WHERE id >= 1001
ORDER BY id;

-- ============================================================================
-- END OF SCRIPT
-- ============================================================================
-- Now test with: curl http://localhost:8081/api/loans/1001/complete
-- Expected: Full data with real names, no "Unknown" or "N/A" values
-- ============================================================================
