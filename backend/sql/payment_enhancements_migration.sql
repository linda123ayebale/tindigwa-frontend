-- ========================================
-- PAYMENT MODULE ENHANCEMENTS
-- Reversal trigger + balance rollback
-- ========================================

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS after_payment_reverse_update_tracking;

-- Create trigger for payment reversal to roll back loan tracking
DELIMITER $$

CREATE TRIGGER after_payment_reverse_update_tracking
AFTER UPDATE ON loan_payments
FOR EACH ROW
BEGIN
  -- When payment status changes to REVERSED, roll back the balance
  IF (OLD.payment_status <> 'REVERSED' AND NEW.payment_status = 'REVERSED') THEN
     UPDATE loan_tracking
     SET 
       outstanding_balance = outstanding_balance + OLD.amount_paid,
       installments_remaining = LEAST(installments_remaining + 1, total_installments),
       completion_percentage = 
         100 * (1 - ((outstanding_balance + OLD.amount_paid) / NULLIF(total_due, 0))),
       updated_at = NOW(6),
       last_calculated_at = NOW(6)
     WHERE loan_id = OLD.loan_id;
  END IF;
END$$

DELIMITER ;

-- ========================================
-- MIGRATION COMPLETE
-- ========================================
