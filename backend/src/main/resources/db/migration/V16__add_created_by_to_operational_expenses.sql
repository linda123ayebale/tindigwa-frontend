-- Add created_by column to operational_expenses table
ALTER TABLE operational_expenses ADD COLUMN created_by VARCHAR(255);

-- Add comment to the column
COMMENT ON COLUMN operational_expenses.created_by IS 'Username or ID of the person who created this expense record';
