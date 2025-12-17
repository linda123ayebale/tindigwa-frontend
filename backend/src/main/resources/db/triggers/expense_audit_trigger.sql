-- Trigger function to log expense status changes
CREATE OR REPLACE FUNCTION log_expense_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Log when approval_status changes
    IF (TG_OP = 'UPDATE' AND OLD.approval_status IS DISTINCT FROM NEW.approval_status) THEN
        INSERT INTO expense_logs (expense_id, action, action_by, action_at, notes)
        VALUES (
            NEW.id,
            NEW.approval_status,
            NEW.approved_by,
            CURRENT_TIMESTAMP,
            NEW.approval_comment
        );
    END IF;
    
    -- Log when payment_status changes
    IF (TG_OP = 'UPDATE' AND OLD.payment_status IS DISTINCT FROM NEW.payment_status) THEN
        INSERT INTO expense_logs (expense_id, action, action_by, action_at, notes)
        VALUES (
            NEW.id,
            NEW.payment_status,
            NEW.paid_by,
            CURRENT_TIMESTAMP,
            'Payment status changed to ' || NEW.payment_status
        );
    END IF;
    
    -- Log when expense is created
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO expense_logs (expense_id, action, action_by, action_at, notes)
        VALUES (
            NEW.id,
            'CREATED',
            NEW.created_by,
            CURRENT_TIMESTAMP,
            'Expense created: ' || NEW.description
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS expense_audit_trigger ON operational_expenses;

-- Create trigger
CREATE TRIGGER expense_audit_trigger
AFTER INSERT OR UPDATE ON operational_expenses
FOR EACH ROW
EXECUTE FUNCTION log_expense_status_change();
