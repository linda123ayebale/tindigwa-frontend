-- ========================================
-- BACKEND OVERHAUL: Loans & Payments Migration
-- ========================================

-- 1) CREATE loan_products TABLE
CREATE TABLE IF NOT EXISTS loan_products (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_code VARCHAR(20) UNIQUE NOT NULL,
  product_name VARCHAR(100) NOT NULL,
  interest_method VARCHAR(20) NOT NULL,        -- 'FLAT' | 'REDUCING' (string for now)
  interest_rate DOUBLE NOT NULL,
  default_frequency VARCHAR(20) DEFAULT 'MONTHLY', -- 'DAILY' | 'WEEKLY' | 'MONTHLY'
  min_amount DOUBLE NOT NULL,
  max_amount DOUBLE NOT NULL,
  min_term INT NOT NULL,
  max_term INT NOT NULL,
  penalty_rule VARCHAR(255) NULL,
  processing_fee_rule VARCHAR(255) NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME(6) DEFAULT NOW(6),
  updated_at DATETIME(6) DEFAULT NOW(6) ON UPDATE NOW(6)
);

-- 2) ALTER loan_details - add lifecycle columns
-- Check and add columns individually since MySQL doesn't support IF NOT EXISTS in ALTER ADD COLUMN
SET @sql_add_disbursed_at = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA='tindigwa' AND TABLE_NAME='loan_details' AND COLUMN_NAME='disbursed_at') = 0,
  'ALTER TABLE loan_details ADD COLUMN disbursed_at DATETIME(6) NULL',
  'SELECT "Column disbursed_at already exists"'
);
PREPARE stmt FROM @sql_add_disbursed_at;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql_add_rejected_by_id = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA='tindigwa' AND TABLE_NAME='loan_details' AND COLUMN_NAME='rejected_by_id') = 0,
  'ALTER TABLE loan_details ADD COLUMN rejected_by_id BIGINT NULL',
  'SELECT "Column rejected_by_id already exists"'
);
PREPARE stmt FROM @sql_add_rejected_by_id;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3) DROP OLD TRACKING TRIGGER
DROP TRIGGER IF EXISTS after_loan_insert_tracking;

-- 4) CREATE NEW TRIGGER - loan_tracking_on_disburse
DELIMITER $$

CREATE TRIGGER loan_tracking_on_disburse
AFTER UPDATE ON loan_details
FOR EACH ROW
BEGIN
  DECLARE interest_amount DOUBLE;
  DECLARE installments INT;
  DECLARE expected_payment DOUBLE;

  IF (OLD.loan_status IS NULL OR OLD.loan_status <> 'DISBURSED')
     AND NEW.loan_status = 'DISBURSED' THEN

    SET interest_amount = COALESCE(NEW.total_payable,0)
                        - COALESCE(NEW.principal_amount,0)
                        - COALESCE(NEW.processing_fee,0);

    SET installments = COALESCE(NEW.number_of_repayments, 0);
    SET expected_payment = CASE WHEN installments > 0
                                THEN NEW.total_payable / installments
                                ELSE 0 END;

    IF NOT EXISTS (SELECT 1 FROM loan_tracking WHERE loan_id = NEW.id) THEN
      INSERT INTO loan_tracking(
        loan_id, loan_number, client_id,
        original_principal, original_interest, processing_fee,
        total_due, outstanding_balance,
        outstanding_principal, outstanding_interest, outstanding_fees, outstanding_penalty,
        payment_frequency, total_installments, installments_remaining, expected_payment_amount,
        next_payment_due_date, loan_release_date, loan_maturity_date, grace_period_days, fine_trigger_date,
        loan_status, completion_percentage, created_at, updated_at, last_calculated_at
      ) VALUES (
        NEW.id, NEW.loan_number, NEW.client_id,
        NEW.principal_amount, interest_amount, NEW.processing_fee,
        NEW.total_payable, NEW.total_payable,
        NEW.principal_amount, interest_amount, NEW.processing_fee, 0.0,
        NEW.repayment_frequency, NEW.number_of_repayments, NEW.number_of_repayments, expected_payment,
        COALESCE(NEW.first_repayment_date, NEW.payment_start_date),
        NEW.release_date, NEW.payment_end_date,
        NEW.grace_period_days,
        DATE_ADD(COALESCE(NEW.first_repayment_date, NEW.payment_start_date), INTERVAL COALESCE(NEW.grace_period_days,0) DAY),
        'IN_PROGRESS',
        0.0, NOW(6), NOW(6), NOW(6)
      );
    END IF;
  END IF;
END$$

DELIMITER ;

-- 5) NORMALIZE loan_payments - add FK and indices
-- Add FK constraint if it doesn't exist
SET @fk_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
  WHERE CONSTRAINT_SCHEMA='tindigwa' 
    AND TABLE_NAME='loan_payments' 
    AND CONSTRAINT_NAME='fk_loan_payments_loan'
);

SET @sql_add_fk = IF(
  @fk_exists = 0,
  'ALTER TABLE loan_payments ADD CONSTRAINT fk_loan_payments_loan FOREIGN KEY (loan_id) REFERENCES loan_details(id) ON UPDATE CASCADE ON DELETE CASCADE',
  'SELECT "FK fk_loan_payments_loan already exists"'
);
PREPARE stmt FROM @sql_add_fk;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Modify boolean columns
ALTER TABLE loan_payments
  MODIFY COLUMN late TINYINT(1) NOT NULL DEFAULT 0,
  MODIFY COLUMN partial_payment TINYINT(1) NOT NULL DEFAULT 0,
  MODIFY COLUMN overpayment TINYINT(1) NOT NULL DEFAULT 0;

-- Create indices (with conditional logic for MySQL compatibility)
SET @idx1_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA='tindigwa' AND TABLE_NAME='loan_payments' AND INDEX_NAME='idx_payments_loan_date'
);
SET @sql_idx1 = IF(
  @idx1_exists = 0,
  'CREATE INDEX idx_payments_loan_date ON loan_payments (loan_id, payment_date DESC)',
  'SELECT "Index idx_payments_loan_date already exists"'
);
PREPARE stmt FROM @sql_idx1;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx2_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA='tindigwa' AND TABLE_NAME='loan_payments' AND INDEX_NAME='idx_payments_status'
);
SET @sql_idx2 = IF(
  @idx2_exists = 0,
  'CREATE INDEX idx_payments_status ON loan_payments (payment_status)',
  'SELECT "Index idx_payments_status already exists"'
);
PREPARE stmt FROM @sql_idx2;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 6) CREATE TRIGGER - after_payment_insert_update_tracking
DROP TRIGGER IF EXISTS after_payment_insert_update_tracking;

DELIMITER $$

CREATE TRIGGER after_payment_insert_update_tracking
AFTER INSERT ON loan_payments
FOR EACH ROW
BEGIN
  UPDATE loan_tracking
  SET 
    outstanding_balance =
      GREATEST(outstanding_balance - NEW.amount_paid, 0),
    installments_remaining =
      GREATEST(installments_remaining - 1, 0),
    completion_percentage =
      100 * (1 - (GREATEST(outstanding_balance - NEW.amount_paid, 0) / NULLIF(total_due,0))),
    updated_at = NOW(6),
    last_calculated_at = NOW(6)
  WHERE loan_id = NEW.loan_id;
END$$

DELIMITER ;

-- ========================================
-- MIGRATION COMPLETE
-- ========================================
