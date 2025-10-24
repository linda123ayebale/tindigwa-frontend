CREATE TABLE expense_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    parent_category_id BIGINT,
    sort_order INT NOT NULL DEFAULT 0,
    budget_limit DECIMAL(19, 4),
    color_code VARCHAR(7) DEFAULT '#000000',
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    
    CONSTRAINT fk_parent_category
        FOREIGN KEY (parent_category_id) 
        REFERENCES expense_categories(id)
        ON DELETE SET NULL
);

-- Create index for active parent categories lookup
CREATE INDEX idx_parent_category_active ON expense_categories(parent_category_id, is_active);

-- Add trigger to prevent circular references
DELIMITER $$
CREATE TRIGGER before_expense_category_update
BEFORE UPDATE ON expense_categories
FOR EACH ROW
BEGIN
    DECLARE current_parent BIGINT DEFAULT NEW.parent_category_id;

    IF NEW.parent_category_id IS NOT NULL THEN
        WHILE current_parent IS NOT NULL DO
            IF current_parent = NEW.id THEN
                SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Circular reference detected in category hierarchy';
            END IF;
            
            SELECT parent_category_id INTO current_parent 
            FROM expense_categories 
            WHERE id = current_parent;
        END WHILE WHILE_LOOP;
    END IF;
END$$
DELIMITER ;
