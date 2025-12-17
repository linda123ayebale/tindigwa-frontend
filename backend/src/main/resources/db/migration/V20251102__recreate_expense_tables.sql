-- Recreate simplified expense module tables
-- Date: 2025-11-02
-- This migration will:
-- 1. Rename existing expense-related tables (if present) to *_old as a backup.
-- 2. Create a clean `expense_categories` table and a simplified `operational_expenses` table.
-- 3. Migrate category and expense data from the old tables into the new tables where possible.
-- 4. Leave *_old backup tables in place (commented DROP statements are provided if you want to remove them later).

-- IMPORTANT: TAKE A BACKUP BEFORE RUNNING THIS MIGRATION:
-- mysqldump -u DB_USER -p --databases tindigwa > tindigwa-backup-$(date +%F).sql

-- 1) Rename old tables to keep backups (safe, idempotent)
SET @sql = NULL;
SELECT IF(EXISTS(SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'operational_expenses'),
  'RENAME TABLE operational_expenses TO operational_expenses_old;', 'SELECT "no_operational_expenses"') INTO @sql;
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT IF(EXISTS(SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'expense_categories'),
  'RENAME TABLE expense_categories TO expense_categories_old;', 'SELECT "no_expense_categories"') INTO @sql;
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2) Create simplified expense_categories table
CREATE TABLE IF NOT EXISTS expense_categories (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  color_code VARCHAR(7) DEFAULT '#000000',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(255)
) ENGINE=InnoDB;

-- Ensure a case-insensitive unique index on normalized name
-- MySQL doesn't support CREATE UNIQUE INDEX IF NOT EXISTS in older versions, so check INFORMATION_SCHEMA
SELECT COUNT(*) INTO @idx_exists FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'expense_categories' AND INDEX_NAME = 'ux_expense_categories_name';

SET @sql = IF(@idx_exists = 0,
  'CREATE UNIQUE INDEX ux_expense_categories_name ON expense_categories (category_name(191))',
  'SELECT "index_exists"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3) Create simplified operational_expenses table (category_id NOT NULL to ensure every expense is under a category)
CREATE TABLE IF NOT EXISTS operational_expenses (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  expense_reference VARCHAR(255) NOT NULL UNIQUE,
  category_id BIGINT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(19,4) NOT NULL,
  expense_date DATE NOT NULL,
  payment_method VARCHAR(255) NULL,
  vendor VARCHAR(255) NULL,
  reference_number VARCHAR(255) NULL,
  receipt_url VARCHAR(1024) NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  notes TEXT NULL,
  created_by VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_operational_expenses_category FOREIGN KEY (category_id) REFERENCES expense_categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE INDEX idx_operational_expenses_category ON operational_expenses(category_id);
CREATE INDEX idx_operational_expenses_date ON operational_expenses(expense_date);
CREATE INDEX idx_operational_expenses_status ON operational_expenses(status(32));

-- 4) Migrate categories from expense_categories_old (if present)
SELECT COUNT(*) INTO @has_categories_old FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'expense_categories_old';

SET @sql = IF(@has_categories_old > 0,
  CONCAT(
    'INSERT INTO expense_categories (category_name, description, is_active, sort_order, color_code, created_at, updated_at, created_by) '
    , 'SELECT category_name, description, is_active, sort_order, color_code, created_at, updated_at, created_by '
    , 'FROM expense_categories_old '
    , 'ON DUPLICATE KEY UPDATE category_name = VALUES(category_name)'
  ),
  'SELECT "no_old_categories"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Ensure default 'Others' exists for mapping fallback
INSERT INTO expense_categories (category_name, description, created_at, updated_at)
SELECT 'Others', 'Default category', NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM expense_categories WHERE LOWER(TRIM(category_name)) = 'others');

-- 5) Migrate operational expenses from operational_expenses_old (if present)
SELECT COUNT(*) INTO @has_expenses_old FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'operational_expenses_old';

SET @sql = IF(@has_expenses_old > 0,
  CONCAT(
    'INSERT INTO operational_expenses (expense_reference, category_id, description, amount, expense_date, payment_method, vendor, reference_number, receipt_url, status, notes, created_by, created_at, updated_at) '
    , 'SELECT '
      , 'COALESCE(oe.expense_reference, CONCAT("EXP-", oe.id)), '
      , 'COALESCE(ec_new.id, (SELECT id FROM expense_categories WHERE LOWER(TRIM(category_name)) = "others" LIMIT 1)), '
      , 'oe.description, '
      , 'oe.amount, '
      , 'oe.expense_date, '
      , 'oe.payment_method, '
      , 'oe.vendor, '
      , 'oe.reference_number, '
      , 'oe.receipt_url, '
      , 'COALESCE(oe.status, ''pending''), '
      , 'oe.notes, '
      , 'oe.created_by, '
      , 'oe.created_at, '
      , 'oe.updated_at '
    , 'FROM operational_expenses_old oe '
    , 'LEFT JOIN expense_categories_old ec_old ON ec_old.id = oe.category_id '
    , 'LEFT JOIN expense_categories ec_new ON LOWER(TRIM(ec_new.category_name)) = LOWER(TRIM(ec_old.category_name)) '
    , 'LEFT JOIN expense_categories ec_fallback ON LOWER(TRIM(ec_fallback.category_name)) = "others" '
    , 'ON DUPLICATE KEY UPDATE expense_reference = VALUES(expense_reference)'
  ),
  'SELECT "no_old_expenses"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- If the old operational_expenses had a text `category` column (and no expense_categories_old), attempt to map by name
SET @sql = IF(@has_expenses_old > 0,
  CONCAT(
    'UPDATE operational_expenses oe_new '
    , 'JOIN operational_expenses_old oe_old ON oe_new.reference_number = oe_old.reference_number OR oe_new.description = oe_old.description '
    , 'SET oe_new.category_id = ( '
        , 'SELECT ec.id FROM expense_categories ec WHERE LOWER(TRIM(ec.category_name)) = LOWER(TRIM(oe_old.category)) LIMIT 1 '
      , ') '
    , 'WHERE (oe_new.category_id IS NULL OR oe_new.category_id = (SELECT id FROM expense_categories WHERE LOWER(TRIM(category_name)) = "others" LIMIT 1)) '
  ),
  'SELECT "no_mapping_needed"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 6) Finalize: ensure no NULL category_id (if any remained, set to 'Others')
UPDATE operational_expenses oe
LEFT JOIN expense_categories ec ON oe.category_id = ec.id
SET oe.category_id = (SELECT id FROM expense_categories WHERE LOWER(TRIM(category_name)) = 'others' LIMIT 1)
WHERE oe.category_id IS NULL OR ec.id IS NULL;

-- 7) (Optional) If you want to drop the old backup tables, uncomment below after verifying the migration
-- DROP TABLE IF EXISTS operational_expenses_old;
-- DROP TABLE IF EXISTS expense_categories_old;

-- 8) Report counts for verification
SELECT COUNT(*) AS new_categories_count FROM expense_categories;
SELECT COUNT(*) AS new_expenses_count FROM operational_expenses;
SELECT COUNT(*) AS orphan_count FROM operational_expenses oe LEFT JOIN expense_categories ec ON oe.category_id = ec.id WHERE oe.category_id IS NOT NULL AND ec.id IS NULL;

-- End of migration
drop table operational_expenses_old;