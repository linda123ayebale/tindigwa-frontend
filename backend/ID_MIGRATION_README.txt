========================================
ID MIGRATION SYSTEM
========================================

AUTOMATIC MIGRATION ON STARTUP
-------------------------------
The IdMigrationService automatically runs when the application starts.
It migrates all existing loans and expenses to use the new 8-character ID format.

Migration logs appear in the console on startup:
- Before migration status (existing IDs)
- After migration status (migrated IDs)
- Success/failure indicator

ID FORMAT
---------
Old format: LN-1000016, EXP-1234567890
New format: LN250001, EX250001

Pattern: <PREFIX><YY><SEQ>
- PREFIX: 2 characters (LN, PM, EX, US, BR, VN)
- YY: 2-digit year (25 for 2025)
- SEQ: 4-digit sequence (0001, 0002, etc.)

Total: 8 characters maximum

MIGRATION BEHAVIOR
------------------
The migration service:
1. Scans all loans and expenses
2. Updates records with:
   - NULL loan_number/expense_reference
   - Empty strings
   - Old format IDs (containing hyphens or > 8 chars)
3. Generates new 8-character IDs
4. Preserves internal numeric IDs for foreign keys

MANUAL MIGRATION (if needed)
-----------------------------
POST http://localhost:8081/api/migration/migrate-ids
GET  http://localhost:8081/api/migration/status

DATABASE FIELDS
---------------
Loans:     loan_number VARCHAR(8) UNIQUE
Expenses:  expense_reference VARCHAR(8) UNIQUE
Payments:  payment_number VARCHAR(8) UNIQUE
Users:     user_code VARCHAR(8) UNIQUE
Branches:  branch_code VARCHAR(8) UNIQUE

FRONTEND DISPLAY
----------------
Tables automatically display:
- loan.loanNumber (Loans.jsx line 506)
- expense.expenseReference (PendingApprovals.jsx line 309)

TESTING
-------
Backend tests: 13/13 passed
Frontend tests: 18/18 passed
Build: SUCCESS

EXAMPLE IDs
-----------
Loans:     LN250001, LN250002, LN250003
Payments:  PM250001, PM250002
Expenses:  EX250001, EX250002
Users:     US250001, US250002
Branches:  BR250001, BR250002
