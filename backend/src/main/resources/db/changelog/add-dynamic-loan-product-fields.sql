-- ========================================
-- Dynamic Loan Product Configuration Migration
-- Adds registration fee tiers and penalty rate fields
-- ========================================

-- Add registration_fee_tiers column (JSON type)
-- Stores tiered registration fees: [{"minAmount": 100000, "maxAmount": 250000, "fee": 5000}, ...]
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'tindigwa' AND TABLE_NAME = 'loan_products' AND COLUMN_NAME = 'registration_fee_tiers');

SET @sql = IF(@column_exists = 0, 
  'ALTER TABLE loan_products ADD COLUMN registration_fee_tiers JSON NULL COMMENT "Tiered registration fees based on principal amount ranges"',
  'SELECT "Column registration_fee_tiers already exists"');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add penalty_rate column (Double)
-- Stores daily penalty rate (e.g., 0.02 for 0.02% per day)
SET @column_exists2 = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'tindigwa' AND TABLE_NAME = 'loan_products' AND COLUMN_NAME = 'penalty_rate');

SET @sql2 = IF(@column_exists2 = 0, 
  'ALTER TABLE loan_products ADD COLUMN penalty_rate DOUBLE NULL COMMENT "Daily penalty rate on reducing balance (e.g., 0.02 = 0.02% per day)"',
  'SELECT "Column penalty_rate already exists"');

PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- Update existing records to have NULL for new fields (backward compatible)
-- No action needed as columns are nullable

-- ========================================
-- Migration complete
-- New fields: registration_fee_tiers, penalty_rate
-- Existing loan products will have NULL values (backward compatible)
-- ========================================
