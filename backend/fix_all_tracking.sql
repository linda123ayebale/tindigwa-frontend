-- Fix tracking for all loans by recalculating from payments
UPDATE loan_tracking lt
INNER JOIN loan_details ld ON lt.loan_id = ld.id
SET 
    lt.cumulative_payment = (
        SELECT COALESCE(SUM(amount_paid), 0)
        FROM loan_payments
        WHERE loan_id = ld.id 
        AND payment_status != 'CANCELLED'
        AND amount_paid > 0
    ),
    lt.cumulative_principal_paid = (
        SELECT COALESCE(SUM(principal_paid), 0)
        FROM loan_payments
        WHERE loan_id = ld.id 
        AND payment_status != 'CANCELLED'
        AND amount_paid > 0
    ),
    lt.cumulative_interest_paid = (
        SELECT COALESCE(SUM(interest_paid), 0)
        FROM loan_payments
        WHERE loan_id = ld.id 
        AND payment_status != 'CANCELLED'
        AND amount_paid > 0
    ),
    lt.cumulative_fees_paid = (
        SELECT COALESCE(SUM(fees_paid), 0)
        FROM loan_payments
        WHERE loan_id = ld.id 
        AND payment_status != 'CANCELLED'
        AND amount_paid > 0
    ),
    lt.outstanding_balance = lt.total_due - (
        SELECT COALESCE(SUM(amount_paid), 0)
        FROM loan_payments
        WHERE loan_id = ld.id 
        AND payment_status != 'CANCELLED'
        AND amount_paid > 0
    ),
    lt.installments_paid = (
        SELECT COUNT(*)
        FROM loan_payments
        WHERE loan_id = ld.id 
        AND payment_status != 'CANCELLED'
        AND amount_paid > 0
    ),
    lt.last_payment_date = (
        SELECT MAX(payment_date)
        FROM loan_payments
        WHERE loan_id = ld.id 
        AND payment_status != 'CANCELLED'
        AND amount_paid > 0
    ),
    lt.last_payment_amount = (
        SELECT amount_paid
        FROM loan_payments
        WHERE loan_id = ld.id 
        AND payment_status != 'CANCELLED'
        AND amount_paid > 0
        ORDER BY payment_date DESC
        LIMIT 1
    ),
    lt.completion_percentage = CASE 
        WHEN lt.total_due > 0 THEN (
            (SELECT COALESCE(SUM(amount_paid), 0)
             FROM loan_payments
             WHERE loan_id = ld.id 
             AND payment_status != 'CANCELLED'
             AND amount_paid > 0) / lt.total_due * 100
        )
        ELSE 0
    END,
    lt.loan_status = CASE 
        WHEN lt.outstanding_balance - (
            SELECT COALESCE(SUM(amount_paid), 0)
            FROM loan_payments
            WHERE loan_id = ld.id 
            AND payment_status != 'CANCELLED'
            AND amount_paid > 0
        ) <= 0.01 THEN 'COMPLETED'
        ELSE lt.loan_status
    END;

-- Show summary
SELECT 
    'Fixed' as status,
    COUNT(*) as loan_count,
    SUM(cumulative_payment) as total_payments_tracked
FROM loan_tracking
WHERE cumulative_payment IS NOT NULL AND cumulative_payment > 0;
