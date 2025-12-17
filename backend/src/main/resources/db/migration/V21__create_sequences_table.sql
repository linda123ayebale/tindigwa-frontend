-- Migration: Universal ID Generation - Create sequences table
-- Purpose: Store and track sequential counters for unique ID generation per module, branch, and month
-- Pattern: <PREFIX><BRANCH><YYMM><SEQ> (e.g., LNKLA25110005)

CREATE TABLE IF NOT EXISTS sequences (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    module_prefix VARCHAR(10) NOT NULL COMMENT 'Module code: LN, PMT, EXP, USR, etc.',
    branch_code VARCHAR(10) NOT NULL COMMENT 'Branch identifier (e.g., KLA, MBA, etc.)',
    year_month VARCHAR(6) NOT NULL COMMENT 'YYMM format (e.g., 2511 for Nov 2025)',
    last_number INT NOT NULL DEFAULT 0 COMMENT 'Last sequence number used',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Composite unique constraint ensures one sequence per module/branch/month combo
    UNIQUE KEY uk_sequences (module_prefix, branch_code, year_month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores sequence counters for universal ID generation system';

-- Create index for faster lookups
CREATE INDEX idx_sequences_lookup ON sequences(module_prefix, branch_code, year_month);
