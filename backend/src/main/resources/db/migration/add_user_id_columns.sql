-- Migration: Add user ID columns to operational_expenses table
-- Purpose: Store user IDs instead of names for better normalization
-- Date: 2025-11-05

-- Add user ID columns
ALTER TABLE operational_expenses 
ADD COLUMN requested_by_user_id BIGINT,
ADD COLUMN approved_by_user_id BIGINT,
ADD COLUMN paid_by_user_id BIGINT;

-- Add foreign key constraints
ALTER TABLE operational_expenses
ADD CONSTRAINT fk_requested_by_user 
    FOREIGN KEY (requested_by_user_id) 
    REFERENCES users(id) 
    ON DELETE SET NULL,
ADD CONSTRAINT fk_approved_by_user 
    FOREIGN KEY (approved_by_user_id) 
    REFERENCES users(id) 
    ON DELETE SET NULL,
ADD CONSTRAINT fk_paid_by_user 
    FOREIGN KEY (paid_by_user_id) 
    REFERENCES users(id) 
    ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX idx_requested_by_user_id ON operational_expenses(requested_by_user_id);
CREATE INDEX idx_approved_by_user_id ON operational_expenses(approved_by_user_id);
CREATE INDEX idx_paid_by_user_id ON operational_expenses(paid_by_user_id);

-- Optional: Keep old string columns for backward compatibility
-- If you want to remove them completely, uncomment these lines:
-- ALTER TABLE operational_expenses DROP COLUMN requested_by;
-- ALTER TABLE operational_expenses DROP COLUMN approved_by;
-- ALTER TABLE operational_expenses DROP COLUMN paid_by;

-- Add comment for documentation
COMMENT ON COLUMN operational_expenses.requested_by_user_id IS 'User ID who created/requested the expense';
COMMENT ON COLUMN operational_expenses.approved_by_user_id IS 'User ID who approved or rejected the expense';
COMMENT ON COLUMN operational_expenses.paid_by_user_id IS 'User ID who marked the expense as paid';
