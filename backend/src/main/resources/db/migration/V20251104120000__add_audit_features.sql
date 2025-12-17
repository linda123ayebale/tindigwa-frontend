-- Add auditing features
-- Date: 2025-11-04

-- Add last_modified_by column to expense_categories if not exists
ALTER TABLE expense_categories 
ADD COLUMN IF NOT EXISTS last_modified_by VARCHAR(255);

-- Add last_modified_by column to operational_expenses if not exists
ALTER TABLE operational_expenses 
ADD COLUMN IF NOT EXISTS last_modified_by VARCHAR(255);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    action VARCHAR(20) NOT NULL,
    performed_by VARCHAR(255),
    old_value TEXT,
    new_value TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(50),
    INDEX idx_audit_logs_entity (entity_type, entity_id),
    INDEX idx_audit_logs_performed_by (performed_by),
    INDEX idx_audit_logs_timestamp (timestamp),
    INDEX idx_audit_logs_action (action)
) ENGINE=InnoDB;
