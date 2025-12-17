-- Add category_id column to operational_expenses table
ALTER TABLE operational_expenses
ADD COLUMN category_id BIGINT;

-- Create categories for existing unique category values that are not already present
INSERT INTO expense_categories (category_name, description, created_at, updated_at)
SELECT DISTINCT oe.category, 'Automatically created from existing expenses', NOW(), NOW()
FROM operational_expenses oe
WHERE oe.category IS NOT NULL
  AND oe.category NOT IN (SELECT category_name FROM expense_categories);

-- Then update the category_id in operational_expenses (use JOIN for reliable updates)
UPDATE operational_expenses oe
JOIN expense_categories ec ON ec.category_name = oe.category
SET oe.category_id = ec.id
WHERE oe.category IS NOT NULL;

-- (Optional) If you want to enforce NOT NULL only when all rows have been set, ensure there are no NULLs before making this change.
-- If there are some expenses without a category value, either assign them a default category or allow NULLs.

-- Make category_id NOT NULL after migration only if you're sure all rows have values
-- ALTER TABLE operational_expenses
-- MODIFY COLUMN category_id BIGINT NOT NULL;

-- Add foreign key constraint after category_id values have been populated
ALTER TABLE operational_expenses
ADD CONSTRAINT fk_operational_expenses_category
FOREIGN KEY (category_id)
REFERENCES expense_categories(id);

-- Finally drop the old category column (only if you no longer need the text column)
ALTER TABLE operational_expenses
DROP COLUMN category;