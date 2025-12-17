-- Fix operational_expenses -> expense_categories foreign key and clean orphaned data
-- Date: 2025-11-02
-- This migration is defensive/idempotent: it will create a default category, add category_id if missing,
-- populate categories from existing text column (if present), map orphaned category_id values to the default,
-- add the FK constraint if absent, and drop the old text column if present.

-- IMPORTANT: BACKUP your database before running this script.
-- To run (example):
--   mysqldump -u DB_USER -p tindigwa > tindigwa-backup.sql
--   mysql -u DB_USER -p tindigwa < V20251102__fix_operational_expenses_fk.sql

-- Create a default 'Uncategorized' category if it doesn't exist (case-insensitive)
INSERT INTO expense_categories (category_name, description, created_at, updated_at)
SELECT 'Uncategorized', 'Automatically created default category', NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM expense_categories WHERE LOWER(TRIM(category_name)) = 'uncategorized'
);

-- Add category_id column to operational_expenses if it doesn't exist
SELECT COUNT(*) INTO @col_exists
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'operational_expenses' AND COLUMN_NAME = 'category_id';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE operational_expenses ADD COLUMN category_id BIGINT',
  'SELECT "column_exists"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Check if the old text column `category` exists
SELECT COUNT(*) INTO @has_text
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'operational_expenses' AND COLUMN_NAME = 'category';

-- If the text column exists, insert missing categories from those text values (case-insensitive)
SET @sql = IF(@has_text > 0,
  CONCAT(
    'INSERT INTO expense_categories (category_name, description, created_at, updated_at) '
    , 'SELECT DISTINCT TRIM(oe.category), ''Automatically created from existing expenses'', NOW(), NOW() '
    , 'FROM operational_expenses oe '
    , 'LEFT JOIN expense_categories ec ON LOWER(TRIM(ec.category_name)) = LOWER(TRIM(oe.category)) '
    , 'WHERE oe.category IS NOT NULL AND TRIM(oe.category) <> '''' AND ec.id IS NULL'
  ),
  'SELECT "no_text_column"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- If the text column exists, update category_id from text column by matching (case-insensitive)
SET @sql = IF(@has_text > 0,
  CONCAT(
    'UPDATE operational_expenses oe '
    , 'JOIN expense_categories ec ON LOWER(TRIM(ec.category_name)) = LOWER(TRIM(oe.category)) '
    , 'SET oe.category_id = ec.id '
    , 'WHERE oe.category IS NOT NULL AND TRIM(oe.category) <> ''''
  ),
  'SELECT "no_update_needed"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Ensure there is a default category id available for mapping
SELECT id INTO @default_cat_id FROM expense_categories WHERE LOWER(TRIM(category_name)) = 'uncategorized' LIMIT 1;

-- Map any orphaned category_id values (non-null but no matching expense_categories.id) to the default category
UPDATE operational_expenses oe
LEFT JOIN expense_categories ec ON oe.category_id = ec.id
SET oe.category_id = @default_cat_id
WHERE oe.category_id IS NOT NULL AND ec.id IS NULL;

-- Add the foreign key constraint if it doesn't already exist
SELECT COUNT(*) INTO @fk_exists
FROM information_schema.TABLE_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'operational_expenses' AND CONSTRAINT_NAME = 'fk_operational_expenses_category';

SET @sql = IF(@fk_exists = 0,
  'ALTER TABLE operational_expenses ADD CONSTRAINT fk_operational_expenses_category FOREIGN KEY (category_id) REFERENCES expense_categories(id) ON DELETE SET NULL',
  'SELECT "fk_exists"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- If the old text column exists, drop it (if you want to keep it, comment out the block below)
SET @sql = IF(@has_text > 0,
  'ALTER TABLE operational_expenses DROP COLUMN category',
  'SELECT "no_drop"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Final check: report any remaining orphaned category_id rows (should be zero)
SELECT COUNT(*) AS orphan_count
FROM operational_expenses oe
LEFT JOIN expense_categories ec ON oe.category_id = ec.id
WHERE oe.category_id IS NOT NULL AND ec.id IS NULL;

-- End of migration

