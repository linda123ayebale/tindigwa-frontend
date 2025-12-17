-- Add marital status and spouse information fields to persons table
-- These fields support spouse consent signatures on loan agreements

ALTER TABLE persons
ADD COLUMN marital_status VARCHAR(20) DEFAULT 'SINGLE' COMMENT 'Marital status: SINGLE or MARRIED',
ADD COLUMN spouse_name VARCHAR(255) COMMENT 'Full name of spouse (required if married)',
ADD COLUMN spouse_phone VARCHAR(20) COMMENT 'Phone number of spouse (required if married)';

-- Add index for faster queries on marital status
CREATE INDEX idx_persons_marital_status ON persons(marital_status);

-- Update existing records to have SINGLE marital status if NULL
UPDATE persons SET marital_status = 'SINGLE' WHERE marital_status IS NULL;
