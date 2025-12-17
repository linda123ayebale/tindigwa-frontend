-- Migration: Add universal ID fields for Loans, Payments, Expenses, and Users
-- These fields will store IDs in format: <PREFIX><YY><SEQ> (e.g., LN250001)
-- Max 8 characters

-- Add unique ID field to loan_details if it doesn't have proper constraint
ALTER TABLE loan_details 
    MODIFY COLUMN loan_number VARCHAR(8) UNIQUE,
    ADD INDEX idx_loan_number (loan_number);

-- Add payment_number field to loan_payments
ALTER TABLE loan_payments 
    ADD COLUMN payment_number VARCHAR(8) UNIQUE AFTER id,
    ADD INDEX idx_payment_number (payment_number);

-- Expense reference already exists in operational_expenses but ensure it's properly indexed
-- expenseReference is already unique, just add index if not exists
ALTER TABLE operational_expenses
    MODIFY COLUMN expense_reference VARCHAR(8) UNIQUE,
    ADD INDEX idx_expense_reference (expense_reference);

-- Add user_code field to users table for universal ID
ALTER TABLE users 
    ADD COLUMN user_code VARCHAR(8) UNIQUE AFTER id,
    ADD INDEX idx_user_code (user_code);

-- Add branch_code field to branches table for universal ID
ALTER TABLE branches 
    ADD COLUMN branch_code VARCHAR(8) UNIQUE AFTER id,
    ADD INDEX idx_branch_code (branch_code);

-- Add vendor_code field to vendor table if it exists
-- Note: Check if vendor table exists first
-- ALTER TABLE vendor 
--     ADD COLUMN vendor_code VARCHAR(50) UNIQUE AFTER id,
--     ADD INDEX idx_vendor_code (vendor_code);
