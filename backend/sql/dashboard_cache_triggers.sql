-- Dashboard Cache Invalidation Triggers
-- These triggers will help identify when dashboard data needs to be refreshed

-- Create a table to track dashboard data changes
CREATE TABLE IF NOT EXISTS dashboard_cache_status (
    id INT PRIMARY KEY AUTO_INCREMENT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_loan_change TIMESTAMP NULL,
    last_payment_change TIMESTAMP NULL,
    last_person_change TIMESTAMP NULL,
    cache_version INT DEFAULT 1
);

-- Insert initial record
INSERT INTO dashboard_cache_status (id, cache_version) VALUES (1, 1)
ON DUPLICATE KEY UPDATE id = 1;

-- Trigger for loans table INSERT
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_loan_insert
AFTER INSERT ON loans
FOR EACH ROW
BEGIN
    UPDATE dashboard_cache_status 
    SET last_loan_change = NOW(), 
        cache_version = cache_version + 1,
        last_updated = NOW()
    WHERE id = 1;
END//
DELIMITER ;

-- Trigger for loans table UPDATE
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_loan_update
AFTER UPDATE ON loans
FOR EACH ROW
BEGIN
    UPDATE dashboard_cache_status 
    SET last_loan_change = NOW(), 
        cache_version = cache_version + 1,
        last_updated = NOW()
    WHERE id = 1;
END//
DELIMITER ;

-- Trigger for loans table DELETE
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_loan_delete
AFTER DELETE ON loans
FOR EACH ROW
BEGIN
    UPDATE dashboard_cache_status 
    SET last_loan_change = NOW(), 
        cache_version = cache_version + 1,
        last_updated = NOW()
    WHERE id = 1;
END//
DELIMITER ;

-- Trigger for payments table INSERT
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_payment_insert
AFTER INSERT ON payments
FOR EACH ROW
BEGIN
    UPDATE dashboard_cache_status 
    SET last_payment_change = NOW(), 
        cache_version = cache_version + 1,
        last_updated = NOW()
    WHERE id = 1;
END//
DELIMITER ;

-- Trigger for payments table UPDATE
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_payment_update
AFTER UPDATE ON payments
FOR EACH ROW
BEGIN
    UPDATE dashboard_cache_status 
    SET last_payment_change = NOW(), 
        cache_version = cache_version + 1,
        last_updated = NOW()
    WHERE id = 1;
END//
DELIMITER ;

-- Trigger for payments table DELETE
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_payment_delete
AFTER DELETE ON payments
FOR EACH ROW
BEGIN
    UPDATE dashboard_cache_status 
    SET last_payment_change = NOW(), 
        cache_version = cache_version + 1,
        last_updated = NOW()
    WHERE id = 1;
END//
DELIMITER ;

-- Trigger for persons table INSERT
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_person_insert
AFTER INSERT ON persons
FOR EACH ROW
BEGIN
    UPDATE dashboard_cache_status 
    SET last_person_change = NOW(), 
        cache_version = cache_version + 1,
        last_updated = NOW()
    WHERE id = 1;
END//
DELIMITER ;

-- Trigger for persons table UPDATE
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_person_update
AFTER UPDATE ON persons
FOR EACH ROW
BEGIN
    UPDATE dashboard_cache_status 
    SET last_person_change = NOW(), 
        cache_version = cache_version + 1,
        last_updated = NOW()
    WHERE id = 1;
END//
DELIMITER ;

-- Trigger for persons table DELETE
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_person_delete
AFTER DELETE ON persons
FOR EACH ROW
BEGIN
    UPDATE dashboard_cache_status 
    SET last_person_change = NOW(), 
        cache_version = cache_version + 1,
        last_updated = NOW()
    WHERE id = 1;
END//
DELIMITER ;

-- View to check cache status
CREATE OR REPLACE VIEW v_dashboard_cache_info AS
SELECT 
    id,
    last_updated,
    last_loan_change,
    last_payment_change,
    last_person_change,
    cache_version,
    TIMESTAMPDIFF(SECOND, last_updated, NOW()) as seconds_since_update
FROM dashboard_cache_status
WHERE id = 1;

-- Query to check if cache needs refresh (example usage)
-- SELECT * FROM v_dashboard_cache_info WHERE seconds_since_update > 30;
