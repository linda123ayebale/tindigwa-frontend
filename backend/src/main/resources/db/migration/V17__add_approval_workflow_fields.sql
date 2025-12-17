-- Add approval workflow fields to operational_expenses table

-- Approval status: draft, pending_approval, approved, rejected
ALTER TABLE operational_expenses ADD COLUMN approval_status VARCHAR(50) DEFAULT 'draft';

-- Who approved/rejected the expense
ALTER TABLE operational_expenses ADD COLUMN approved_by VARCHAR(255);

-- When the expense was approved
ALTER TABLE operational_expenses ADD COLUMN approved_at TIMESTAMP;

-- Reason for rejection (if rejected)
ALTER TABLE operational_expenses ADD COLUMN rejection_reason TEXT;

-- When the expense was submitted for approval
ALTER TABLE operational_expenses ADD COLUMN submitted_for_approval_at TIMESTAMP;

-- Who submitted the expense for approval
ALTER TABLE operational_expenses ADD COLUMN submitted_by VARCHAR(255);

-- Add comments to columns
COMMENT ON COLUMN operational_expenses.approval_status IS 'Approval workflow status: draft, pending_approval, approved, rejected';
COMMENT ON COLUMN operational_expenses.approved_by IS 'Username or ID of the person who approved/rejected this expense';
COMMENT ON COLUMN operational_expenses.approved_at IS 'Timestamp when the expense was approved or rejected';
COMMENT ON COLUMN operational_expenses.rejection_reason IS 'Reason provided when rejecting the expense';
COMMENT ON COLUMN operational_expenses.submitted_for_approval_at IS 'Timestamp when the expense was submitted for approval';
COMMENT ON COLUMN operational_expenses.submitted_by IS 'Username or ID of the person who submitted the expense for approval';

-- Create index on approval_status for faster queries
CREATE INDEX idx_operational_expenses_approval_status ON operational_expenses(approval_status);
