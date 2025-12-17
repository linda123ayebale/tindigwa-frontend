-- Add performance indexes for expense queries
-- Date: 2025-11-04

-- Index on expense_date for date range queries (if not exists)
CREATE INDEX IF NOT EXISTS idx_operational_expenses_expense_date 
ON operational_expenses(expense_date);

-- Index on status for filtering (if not exists)
CREATE INDEX IF NOT EXISTS idx_operational_expenses_status 
ON operational_expenses(status);

-- Index on category_id for JOIN operations (if not exists)
CREATE INDEX IF NOT EXISTS idx_operational_expenses_category_id 
ON operational_expenses(category_id);

-- Composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_operational_expenses_category_date 
ON operational_expenses(category_id, expense_date);

CREATE INDEX IF NOT EXISTS idx_operational_expenses_status_date 
ON operational_expenses(status, expense_date);

-- Index on vendor for searching
CREATE INDEX IF NOT EXISTS idx_operational_expenses_vendor 
ON operational_expenses(vendor);

-- Index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_operational_expenses_created_at 
ON operational_expenses(created_at);

-- Index on expense_reference for lookup
CREATE INDEX IF NOT EXISTS idx_operational_expenses_reference 
ON operational_expenses(expense_reference);

-- Category indexes
CREATE INDEX IF NOT EXISTS idx_expense_categories_active 
ON expense_categories(is_active);

CREATE INDEX IF NOT EXISTS idx_expense_categories_name 
ON expense_categories(category_name);

-- Composite index for active categories sorted
CREATE INDEX IF NOT EXISTS idx_expense_categories_active_created 
ON expense_categories(is_active, created_at DESC);
