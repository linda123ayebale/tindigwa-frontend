-- ========================================
-- Seed Data for Tindigwa Loan Products
-- Creates 3 loan products with dynamic fee configuration
-- ========================================

-- Shared registration fee tiers for all products:
-- 100k-250k = 5000
-- 260k-500k = 10000
-- 510k-1m = 15000
SET @registration_tiers = '[{"minAmount": 100000, "maxAmount": 250000, "fee": 5000}, {"minAmount": 260000, "maxAmount": 500000, "fee": 10000}, {"minAmount": 510000, "maxAmount": 1000000, "fee": 15000}]';

-- Standard configuration
SET @processing_fee_rate = 4.0;  -- 4% processing fee
SET @penalty_rate = 0.02;         -- 0.02% per day on reducing balance
SET @penalty_grace_days = 14;     -- 14 days grace period before penalties apply

-- ========================================
-- 1. SALARY LOAN PRODUCT
-- Interest: 22%, Frequency: Monthly, Max Duration: 100 days
-- ========================================
INSERT INTO loan_products (
    product_code,
    product_name,
    description,
    default_interest_rate,
    interest_method,
    interest_type,
    rate_per,
    min_duration,
    max_duration,
    default_duration,
    duration_unit,
    min_amount,
    max_amount,
    allowed_repayment_frequencies,
    default_repayment_frequency,
    processing_fee_type,
    processing_fee_value,
    late_fee,
    default_fee,
    default_grace_period_days,
    registration_fee_tiers,
    penalty_rate,
    active,
    requires_guarantor,
    requires_collateral,
    created_at,
    updated_at
) VALUES (
    'LP-SALARY-001',
    'Salary Loan',
    'Short-term loan for salaried employees. Monthly repayment with maximum duration of 100 days.',
    22.0,                           -- 22% interest rate
    'flat',                         -- Flat interest method
    'percentage',
    'month',                        -- Per month
    30,                             -- Min 30 days (1 month)
    100,                            -- Max 100 days (~3 months)
    90,                             -- Default 90 days (3 months)
    'days',
    50000,                          -- Min amount 50k
    1000000,                        -- Max amount 1M
    'monthly',                      -- Only monthly payments
    'monthly',
    'percentage',
    @processing_fee_rate,           -- 4% processing fee
    0,
    0,
    @penalty_grace_days,            -- 14 days grace
    @registration_tiers,            -- Tiered registration fees
    @penalty_rate,                  -- 0.02% per day penalty
    1,                              -- Active
    1,                              -- Guarantor always required
    0,                              -- No collateral required
    NOW(),
    NOW()
);

-- ========================================
-- 2. BUSINESS LOAN PRODUCT
-- Interest: 20%, Frequency: Daily, Max Duration: 32 days
-- ========================================
INSERT INTO loan_products (
    product_code,
    product_name,
    description,
    default_interest_rate,
    interest_method,
    interest_type,
    rate_per,
    min_duration,
    max_duration,
    default_duration,
    duration_unit,
    min_amount,
    max_amount,
    allowed_repayment_frequencies,
    default_repayment_frequency,
    processing_fee_type,
    processing_fee_value,
    late_fee,
    default_fee,
    default_grace_period_days,
    registration_fee_tiers,
    penalty_rate,
    active,
    requires_guarantor,
    requires_collateral,
    created_at,
    updated_at
) VALUES (
    'LP-BUSINESS-001',
    'Business Loan',
    'Short-term business loan with daily repayment. Maximum period of 32 days with penalties on reducing balance after loan period.',
    20.0,                           -- 20% interest rate
    'flat',                         -- Flat interest method
    'percentage',
    'month',                        -- Per month (though paid daily)
    7,                              -- Min 7 days (1 week)
    32,                             -- Max 32 days (1 month)
    30,                             -- Default 30 days
    'days',
    100000,                         -- Min amount 100k
    5000000,                        -- Max amount 5M
    'daily,weekly,bi-weekly',       -- Daily, weekly, or bi-weekly
    'daily',                        -- Default daily
    'percentage',
    @processing_fee_rate,           -- 4% processing fee
    0,
    0,
    @penalty_grace_days,            -- 14 days grace (after 32 day loan period)
    @registration_tiers,            -- Tiered registration fees
    @penalty_rate,                  -- 0.02% per day penalty on reducing balance
    1,                              -- Active
    1,                              -- Guarantor required
    0,                              -- No collateral required
    NOW(),
    NOW()
);

-- ========================================
-- 3. SCHOOL FEES LOAN PRODUCT
-- Interest: 25%, Frequency: Flexible, Max Duration: 100 days
-- ========================================
INSERT INTO loan_products (
    product_code,
    product_name,
    description,
    default_interest_rate,
    interest_method,
    interest_type,
    rate_per,
    min_duration,
    max_duration,
    default_duration,
    duration_unit,
    min_amount,
    max_amount,
    allowed_repayment_frequencies,
    default_repayment_frequency,
    processing_fee_type,
    processing_fee_value,
    late_fee,
    default_fee,
    default_grace_period_days,
    registration_fee_tiers,
    penalty_rate,
    active,
    requires_guarantor,
    requires_collateral,
    created_at,
    updated_at
) VALUES (
    'LP-SCHOOL-001',
    'School Fees Loan',
    'Education loan for school fees payment. Flexible repayment periods determined by client but must be completed within 100 days.',
    25.0,                           -- 25% interest rate
    'flat',                         -- Flat interest method
    'percentage',
    'month',                        -- Per month
    30,                             -- Min 30 days (1 month)
    100,                            -- Max 100 days (~3 months)
    90,                             -- Default 90 days (3 months)
    'days',
    100000,                         -- Min amount 100k
    3000000,                        -- Max amount 3M
    'daily,weekly,bi-weekly,monthly',  -- Flexible: daily, weekly, bi-weekly, or monthly
    'monthly',                      -- Default monthly
    'percentage',
    @processing_fee_rate,           -- 4% processing fee
    0,
    0,
    @penalty_grace_days,            -- 14 days grace
    @registration_tiers,            -- Tiered registration fees
    @penalty_rate,                  -- 0.02% per day penalty
    1,                              -- Active
    1,                              -- Guarantor required
    0,                              -- No collateral required
    NOW(),
    NOW()
);

-- ========================================
-- Seed Data Complete
-- Created 3 loan products:
-- 1. Salary Loan (22%, monthly, 100 days)
-- 2. Business Loan (20%, daily, 32 days)
-- 3. School Fees Loan (25%, flexible, 100 days)
--
-- All products share:
-- - Registration fee tiers: 100k-250k=5k, 260k-500k=10k, 510k-1m=15k
-- - Processing fee: 4%
-- - Penalty rate: 0.02% per day on reducing balance
-- - Grace period: 14 days before penalties apply
-- - Guarantor: Always required
-- - Collateral: Not required
-- ========================================
