-- Fix tracking data for loan_id=3 by recalculating from payments
-- This script recalculates cumulative totals from the loan_payments table

UPDATE loan_tracking lt
SET 
    -- Recalculate cumulative payments from loan_payments
    cumulative_payment = (
        SELECT COALESCE(SUM(amount_paid), 0)
        FROM loan_payments
        WHERE loan_id = 3 
        AND payment_status != 'CANCELLED'
        AND amount_paid > 0
    ),
    cumulative_principal_paid = (
        SELECT COALESCE(SUM(principal_paid), 0)
        FROM loan_payments
        WHERE loan_id = 3 
        AND payment_status != 'CANCELLED'
        AND amount_paid > 0
    ),
    cumulative_interest_paid = (
        SELECT COALESCE(SUM(interest_paid), 0)
        FROM loan_payments
        WHERE loan_id = 3 
        AND payment_status != 'CANCELLED'
        AND amount_paid > 0
    ),
    cumulative_fees_paid = (
        SELECT COALESCE(SUM(fees_paid), 0)
        FROM loan_payments
        WHERE loan_id = 3 
        AND payment_status != 'CANCELLED'
        AND amount_paid > 0
    ),
    cumulative_penalty = (
        SELECT COALESCE(SUM(fine), 0)
        FROM loan_payments
        WHERE loan_id = 3 
        AND payment_status != 'CANCELLED'
        AND fine > 0
    ),
    cumulative_penalty_paid = (
        SELECT COALESCE(SUM(fine), 0)
        FROM loan_payments
        WHERE loan_id = 3 
        AND payment_status != 'CANCELLED'
        AND fine > 0
    ),
    -- Recalculate outstanding balance
    outstanding_balance = lt.total_due - (
        SELECT COALESCE(SUM(amount_paid), 0)
        FROM loan_payments
        WHERE loan_id = 3 
        AND payment_status != 'CANCELLED'
        AND amount_paid > 0
    ),
    -- Update installments paid
    installments_paid = (
        SELECT COUNT(*)
        FROM loan_payments
        WHERE loan_id = 3 
        AND payment_status != 'CANCELLED'
        AND amount_paid > 0
    ),
    -- Update last payment info
    last_payment_date = (
        SELECT MAX(payment_date)
        FROM loan_payments
        WHERE loan_id = 3 
        AND payment_status != 'CANCELLED'
        AND amount_paid > 0
    ),
    last_payment_amount = (
        SELECT amount_paid
        FROM loan_payments
        WHERE loan_id = 3 
        AND payment_status != 'CANCELLED'
        AND amount_paid > 0
        ORDER BY payment_date DESC
        LIMIT 1
    ),
    -- Update loan status to COMPLETED if fully paid
    loan_status = CASE 
        WHEN (lt.total_due - (
            SELECT COALESCE(SUM(amount_paid), 0)
            FROM loan_payments
            WHERE loan_id = 3 
            AND payment_status != 'CANCELLED'
            AND amount_paid > 0
        )) <= 0.01 THEN 'COMPLETED'
        ELSE lt.loan_status
    END,
    -- Update payment status
    payment_status = CASE 
        WHEN (lt.total_due - (
            SELECT COALESCE(SUM(amount_paid), 0)
            FROM loan_payments
            WHERE loan_id = 3 
            AND payment_status != 'CANCELLED'
            AND amount_paid > 0
        )) <= 0.01 THEN 'COMPLETED'
        ELSE lt.payment_status
    END,
    -- Update completion percentage
    completion_percentage = (
        (SELECT COALESCE(SUM(amount_paid), 0)
         FROM loan_payments
         WHERE loan_id = 3 
         AND payment_status != 'CANCELLED'
         AND amount_paid > 0) / lt.total_due * 100
    ),
    is_current = CASE 
        WHEN (lt.total_due - (
            SELECT COALESCE(SUM(amount_paid), 0)
            FROM loan_payments
            WHERE loan_id = 3 
            AND payment_status != 'CANCELLED'
            AND amount_paid > 0
        )) <= 0.01 THEN TRUE
        ELSE lt.is_current
    END,
    is_late = CASE 
        WHEN (lt.total_due - (
            SELECT COALESCE(SUM(amount_paid), 0)
            FROM loan_payments
            WHERE loan_id = 3 
            AND payment_status != 'CANCELLED'
            AND amount_paid > 0
        )) <= 0.01 THEN FALSE
        ELSE lt.is_late
    END,
    days_late = CASE 
        WHEN (lt.total_due - (
            SELECT COALESCE(SUM(amount_paid), 0)
            FROM loan_payments
            WHERE loan_id = 3 
            AND payment_status != 'CANCELLED'
            AND amount_paid > 0
        )) <= 0.01 THEN 0
        ELSE lt.days_late
    END
WHERE lt.loan_id = 3;

-- Show the updated tracking record
SELECT 
    loan_id,
    cumulative_payment,
    outstanding_balance,
    loan_status,
    payment_status,
    completion_percentage,
    installments_paid
FROM loan_tracking 
WHERE loan_id = 3;
