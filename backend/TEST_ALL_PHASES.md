# Comprehensive Testing Guide - All Phases

**Date**: 2025-11-04

This document provides step-by-step testing for all implemented phases.

---

## Pre-Testing Setup

### 1. Reload Maven Dependencies
```bash
cd /home/blessing/Projects/Others/tindigwa-frontend/backend
# In IntelliJ: Right-click pom.xml → Maven → Reload Project
```

### 2. Rebuild Project
```bash
# In IntelliJ: Build → Rebuild Project (Ctrl+F9)
# Or via Maven:
mvn clean compile
```

### 3. Start Application
```bash
mvn spring-boot:run
# Or run from IntelliJ
```

### 4. Verify Migrations Ran
Check logs for:
```
Flyway: Successfully applied X migrations
```

---

## Phase 1 Testing: Safety & Data Integrity

### Test 1: Create Category with Validation
```bash
# Valid category
curl -X POST http://localhost:8080/api/expense-categories \
  -H "Content-Type: application/json" \
  -d '{
    "categoryName": "Office Supplies",
    "description": "Office supplies and stationery",
    "colorCode": "#FF5733"
  }'

# Expected: 201 Created with category data

# Invalid - missing name
curl -X POST http://localhost:8080/api/expense-categories \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Test"
  }'

# Expected: 400 Bad Request with validation errors
```

### Test 2: Duplicate Category Name
```bash
# Try to create duplicate
curl -X POST http://localhost:8080/api/expense-categories \
  -H "Content-Type: application/json" \
  -d '{
    "categoryName": "Office Supplies",
    "description": "Duplicate test"
  }'

# Expected: 409 Conflict - "Category already exists with name: Office Supplies"
```

### Test 3: Safe Category Deletion
```bash
# Create category
CATEGORY_ID=$(curl -s -X POST http://localhost:8080/api/expense-categories \
  -H "Content-Type: application/json" \
  -d '{"categoryName":"DeleteTest","description":"Test"}' | jq -r '.id')

# Create expense with that category
curl -X POST http://localhost:8080/api/expenses \
  -H "Content-Type: application/json" \
  -d "{
    \"categoryId\": $CATEGORY_ID,
    \"description\": \"Test expense\",
    \"amount\": 100.00,
    \"expenseDate\": \"2025-11-04\"
  }"

# Try to delete category (should fail)
curl -X DELETE http://localhost:8080/api/expense-categories/$CATEGORY_ID

# Expected: 409 Conflict - "Cannot delete category with id X: it has 1 associated expenses"
```

### Test 4: Soft Delete (Deactivate)
```bash
# Deactivate instead
curl -X PUT http://localhost:8080/api/expense-categories/$CATEGORY_ID/deactivate

# Expected: 200 OK with isActive=false

# Try to create expense with inactive category
curl -X POST http://localhost:8080/api/expenses \
  -H "Content-Type: application/json" \
  -d "{
    \"categoryId\": $CATEGORY_ID,
    \"description\": \"Should fail\",
    \"amount\": 50.00,
    \"expenseDate\": \"2025-11-04\"
  }"

# Expected: 400 Bad Request - "Cannot use inactive category"
```

---

## Phase 2 Testing: DTOs & API Contracts

### Test 5: DTO Response Structure
```bash
# Create category and verify DTO structure
RESPONSE=$(curl -s -X POST http://localhost:8080/api/expense-categories \
  -H "Content-Type: application/json" \
  -d '{
    "categoryName": "Travel",
    "description": "Travel and transportation",
    "colorCode": "#3498db"
  }')

echo $RESPONSE | jq

# Verify response has: id, categoryName, description, isActive, sortOrder, colorCode, createdAt, updatedAt
```

### Test 6: Nested Category in Expense Response
```bash
# Create expense
EXPENSE_RESPONSE=$(curl -s -X POST http://localhost:8080/api/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": 1,
    "description": "Flight tickets",
    "amount": 450.00,
    "expenseDate": "2025-11-04",
    "vendor": "Airline"
  }')

echo $EXPENSE_RESPONSE | jq

# Verify nested category object: .category.id, .category.categoryName, etc.
```

### Test 7: Swagger UI Access
```bash
# Open in browser
xdg-open http://localhost:8080/swagger-ui.html 2>/dev/null || \
  echo "Open http://localhost:8080/swagger-ui.html in browser"

# Verify:
# - API documentation is visible
# - "Expense Categories" tag present
# - Can try endpoints interactively
```

---

## Phase 3 Testing: Performance & Optimization

### Test 8: Cache Verification
```bash
# First call (cache miss)
time curl -s http://localhost:8080/api/expense-categories > /dev/null

# Second call (cache hit - should be faster)
time curl -s http://localhost:8080/api/expense-categories > /dev/null

# Verify second call is significantly faster
```

### Test 9: Cache Invalidation
```bash
# Fetch categories (populate cache)
curl -s http://localhost:8080/api/expense-categories | jq length

# Create new category (invalidates cache)
curl -X POST http://localhost:8080/api/expense-categories \
  -H "Content-Type: application/json" \
  -d '{"categoryName":"CacheTest","description":"Test cache invalidation"}'

# Fetch again (cache miss, then repopulated)
curl -s http://localhost:8080/api/expense-categories | jq length

# Count should have increased
```

### Test 10: LAZY Fetching (Check Logs)
```bash
# Enable SQL logging in application.properties:
# spring.jpa.show-sql=true
# spring.jpa.properties.hibernate.format_sql=true

# Fetch expenses
curl -s http://localhost:8080/api/expenses | jq length

# Check logs: Should see single query with LEFT JOIN for category
# No N+1 queries
```

### Test 11: Index Performance (Requires Data)
```bash
# Create 100 test expenses with various dates
for i in {1..100}; do
  curl -s -X POST http://localhost:8080/api/expenses \
    -H "Content-Type: application/json" \
    -d "{
      \"categoryId\": 1,
      \"description\": \"Test expense $i\",
      \"amount\": $((RANDOM % 500 + 50)),
      \"expenseDate\": \"2025-$(printf %02d $((RANDOM % 12 + 1)))-$(printf %02d $((RANDOM % 28 + 1)))\"
    }" > /dev/null &
done
wait

# Query with date filter (should use index)
time curl -s "http://localhost:8080/api/expenses/filter?startDate=2025-01-01&endDate=2025-06-30" | jq length

# Should be fast even with 100+ records
```

---

## Phase 4 Testing: Enhanced Features

### Test 12: Automatic Auditing
```bash
# Create category (check created_by)
AUDIT_RESPONSE=$(curl -s -X POST http://localhost:8080/api/expense-categories \
  -H "Content-Type: application/json" \
  -d '{"categoryName":"AuditTest","description":"Testing audit"}')

echo $AUDIT_RESPONSE | jq

# Note: If not authenticated, created_by will be "system"
# Verify: createdBy and lastModifiedBy fields present
```

### Test 13: Audit Log Creation
```bash
# Check database for audit logs
mysql -u root -p tindigwa -e "SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 5;"

# Or via application (if audit log endpoint exists)
# Should see CREATE and UPDATE actions logged
```

### Test 14: Update Audit Trail
```bash
# Update category
curl -X PUT http://localhost:8080/api/expense-categories/1 \
  -H "Content-Type: application/json" \
  -d '{
    "categoryName": "Office Supplies Updated",
    "description": "Updated description"
  }'

# Check audit logs again
mysql -u root -p tindigwa -e "
  SELECT entity_type, entity_id, action, performed_by, timestamp 
  FROM audit_logs 
  WHERE entity_type = 'ExpenseCategory' AND entity_id = 1 
  ORDER BY timestamp DESC;"

# Should see CREATE and UPDATE entries
```

---

## Integration Testing

### Test 15: Complete Workflow
```bash
#!/bin/bash

echo "=== Complete Expense Workflow Test ==="

# 1. Create category
echo "Creating category..."
CAT_RESPONSE=$(curl -s -X POST http://localhost:8080/api/expense-categories \
  -H "Content-Type: application/json" \
  -d '{
    "categoryName": "Marketing",
    "description": "Marketing and advertising expenses",
    "colorCode": "#e74c3c"
  }')
CAT_ID=$(echo $CAT_RESPONSE | jq -r '.id')
echo "Category ID: $CAT_ID"

# 2. List categories (cache test)
echo "Fetching categories..."
curl -s http://localhost:8080/api/expense-categories | jq length

# 3. Create expense
echo "Creating expense..."
EXP_RESPONSE=$(curl -s -X POST http://localhost:8080/api/expenses \
  -H "Content-Type: application/json" \
  -d "{
    \"categoryId\": $CAT_ID,
    \"description\": \"Facebook ads campaign\",
    \"amount\": 250.00,
    \"expenseDate\": \"2025-11-04\",
    \"vendor\": \"Facebook\",
    \"status\": \"paid\"
  }")
EXP_ID=$(echo $EXP_RESPONSE | jq -r '.id')
echo "Expense ID: $EXP_ID"

# 4. Fetch expense (verify nested category)
echo "Fetching expense..."
curl -s http://localhost:8080/api/expenses/$EXP_ID | jq

# 5. Update expense
echo "Updating expense..."
curl -s -X PUT http://localhost:8080/api/expenses/$EXP_ID \
  -H "Content-Type: application/json" \
  -d "{
    \"categoryId\": $CAT_ID,
    \"description\": \"Facebook ads campaign - Q4\",
    \"amount\": 300.00,
    \"expenseDate\": \"2025-11-04\",
    \"vendor\": \"Facebook\",
    \"status\": \"paid\"
  }" | jq

# 6. Filter expenses by category
echo "Filtering expenses..."
curl -s "http://localhost:8080/api/expenses/category/Marketing" | jq length

# 7. Deactivate category (should fail - has expenses)
echo "Testing safe delete..."
curl -s -X DELETE http://localhost:8080/api/expense-categories/$CAT_ID | jq

# 8. Soft delete instead
echo "Deactivating category..."
curl -s -X PUT http://localhost:8080/api/expense-categories/$CAT_ID/deactivate | jq

# 9. Try to create expense with inactive category (should fail)
echo "Testing inactive category..."
curl -s -X POST http://localhost:8080/api/expenses \
  -H "Content-Type: application/json" \
  -d "{
    \"categoryId\": $CAT_ID,
    \"description\": \"Should fail\",
    \"amount\": 100.00,
    \"expenseDate\": \"2025-11-04\"
  }" | jq

echo "=== Workflow Complete ==="
```

---

## Performance Benchmarking

### Test 16: Load Testing (Optional)
```bash
# Install Apache Bench if not installed
# sudo apt-get install apache2-utils

# Test category list endpoint
ab -n 1000 -c 10 http://localhost:8080/api/expense-categories

# Observe:
# - Requests per second
# - Response times
# - Cache performance
```

---

## Database Verification

### Test 17: Schema Changes
```bash
mysql -u root -p tindigwa << EOF
-- Verify new columns
DESCRIBE expense_categories;
DESCRIBE operational_expenses;
DESCRIBE audit_logs;

-- Verify indexes
SHOW INDEX FROM operational_expenses;
SHOW INDEX FROM expense_categories;

-- Check audit log entries
SELECT COUNT(*) as audit_log_count FROM audit_logs;
SELECT entity_type, action, COUNT(*) as count 
FROM audit_logs 
GROUP BY entity_type, action;
EOF
```

---

## Error Handling Tests

### Test 18: Validation Errors
```bash
# Test various validation failures
curl -X POST http://localhost:8080/api/expense-categories \
  -H "Content-Type: application/json" \
  -d '{"categoryName":"A"}' | jq

# Expected: Validation error - name too short

curl -X POST http://localhost:8080/api/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": 999,
    "description": "Test",
    "amount": -10,
    "expenseDate": "2025-11-04"
  }' | jq

# Expected: Amount validation error
```

---

## Success Criteria

All phases successfully implemented if:

✅ **Phase 1**: 
- Validation errors return 400 with details
- Duplicate categories return 409
- Safe delete prevents deletion of categories with expenses
- Soft delete (deactivate) works correctly

✅ **Phase 2**:
- Responses use DTOs (not raw entities)
- Expense responses include nested category object
- Swagger UI is accessible and documented

✅ **Phase 3**:
- Second category fetch is instant (cached)
- SQL logs show single query with JOIN (no N+1)
- Filtered queries are fast even with 100+ records

✅ **Phase 4**:
- created_by and last_modified_by are populated
- audit_logs table contains entries
- Events are logged asynchronously

---

## Troubleshooting

### If Migrations Don't Run:
```bash
# Check Flyway status
mysql -u root -p tindigwa -e "SELECT * FROM flyway_schema_history ORDER BY installed_rank DESC LIMIT 5;"

# Manually run if needed
mysql -u root -p tindigwa < src/main/resources/db/migration/V20251104__add_performance_indexes.sql
```

### If Cache Not Working:
```bash
# Verify @EnableCaching is present
grep -r "@EnableCaching" src/

# Check logs for cache initialization
grep -i "cache" logs/application.log
```

### If Auditing Not Working:
```bash
# Verify columns exist
mysql -u root -p tindigwa -e "DESCRIBE expense_categories;" | grep -i modified

# Check @EnableJpaAuditing
grep -r "@EnableJpaAuditing" src/
```

---

## Cleanup After Testing

```bash
# Optional: Clean up test data
mysql -u root -p tindigwa << EOF
DELETE FROM operational_expenses WHERE description LIKE 'Test%';
DELETE FROM expense_categories WHERE category_name LIKE '%Test%';
DELETE FROM audit_logs WHERE entity_type = 'ExpenseCategory';
EOF
```

---

## Next Steps

1. Review all test results
2. Check application logs for errors
3. Verify Swagger documentation
4. Test with actual authentication (if security is configured)
5. Deploy to staging environment
6. Monitor performance in production

**All tests should pass with the implemented changes!**
