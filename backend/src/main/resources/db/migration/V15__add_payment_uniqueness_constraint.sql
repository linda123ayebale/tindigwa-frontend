-- Migration to prevent duplicate payment records
-- This adds a unique index to ensure no duplicate payments are created

-- Add unique constraint on loan_id + payment_date + amount_paid + created_at
-- This prevents exact duplicates while allowing legitimate multiple payments on the same day
ALTER TABLE loan_payments 
ADD UNIQUE INDEX idx_unique_payment (loan_id, payment_date, amount_paid, reference_number(100));

-- Note: We include reference_number to allow multiple payments with same amount on same date
-- but with different references (e.g., multiple payment methods)
