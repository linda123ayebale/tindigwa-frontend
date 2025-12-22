# Loan Module E2E Tests

Comprehensive Playwright end-to-end tests that verify loan table pages match backend API responses.

## Overview

These tests validate that:
- ✅ Frontend tables display the same data as backend `/api/loans/**` endpoints
- ✅ All tables use consistent column structures
- ✅ Pagination works correctly (5 rows per page)
- ✅ LoanResponse DTO fields are properly mapped to table cells
- ✅ Data formatting (currency, dates, status) is consistent

## Test Coverage

### Pages Tested

1. **Pending Approvals** (`/loans/pending-approvals`)
   - API: `/api/loans/pending-approval`
   - Columns: 7 (Loan Number, Client, Product, Amount, Status, Date, Actions)

2. **Rejected Loans** (`/loans/rejected`)
   - API: `/api/loans/rejected`
   - Columns: 8 (includes Rejection Reason column)

3. **All Loans** (`/loans`)
   - API: `/api/loans`
   - Columns: 7

### What Each Test Validates

For each page, the test:

1. **Fetches API data** - Gets loans from backend endpoint
2. **Navigates to page** - Opens the React page
3. **Waits for load** - Ensures table or empty state is visible
4. **Verifies structure** - Checks column count and headers
5. **Validates pagination** - Confirms first page shows 5 rows (or less if < 5 total)
6. **Compares data cell-by-cell**:
   - Loan Number matches `dto.loanNumber`
   - Client matches `dto.clientName`
   - Product matches `dto.loanProductName`
   - Amount matches `dto.principalAmount` (normalized)
   - Status matches `dto.workflowStatus` (normalized)
   - Date is present if `dto.releaseDate` or `dto.createdAt` exists
7. **Tests pagination** - Clicks "Next" if > 5 items, verifies second page

## Prerequisites

### Backend
```bash
cd backend
mvn spring-boot:run
```

Backend should be running on `http://localhost:8081`

### Frontend
```bash
cd frontend
npm start
```

Frontend should be running on `http://localhost:3000`

## Running Tests

### Quick Run (Headless)
```bash
cd frontend
npm run test:e2e
```

### With Browser Visible
```bash
npm run test:e2e:headed
```

### Debug Mode (Step-by-step)
```bash
npm run test:e2e:debug
```

### Custom URLs
```bash
FRONTEND_BASE_URL=http://localhost:3001 \
BACKEND_BASE_URL=REACT_APP_API_BASE_URL \
npm run test:e2e
```

## Test Structure

```
tests/e2e/
├── utils/
│   ├── api.ts           # API fetching and data normalization
│   ├── selectors.ts     # DOM selectors for tables
│   └── assertions.ts    # Common test assertions
├── loans-table.spec.ts  # Main test spec
└── README.md            # This file
```

## Utilities

### API Utils (`utils/api.ts`)

```typescript
// Fetch loans from backend
const loans = await getLoans('/loans/pending-approval');

// Normalize money strings for comparison
normalizeMoney('$500,000') === '500000'

// Normalize status strings
normalizeStatus('PENDING_APPROVAL') === 'pendingapproval'

// Extract numeric amount from formatted string
extractAmount('$500,000.00') === 500000
```

### Selectors (`utils/selectors.ts`)

```typescript
// Access table cells
table.cell(rowIndex, columnIndex)

// Access pagination
pagination.nextButton
pagination.info

// Check empty state
emptyState.container
```

### Assertions (`utils/assertions.ts`)

```typescript
// Verify table structure
await expectTableColumns(page, 7);

// Get row count
const count = await getRenderedRows(page);

// Wait for table to load
await waitForTableLoad(page);
```

## Common Issues

### Test Fails: "Backend not accessible"
**Solution**: Start the backend first
```bash
cd backend && mvn spring-boot:run
```

### Test Fails: "Element not found"
**Possible causes**:
1. Frontend route changed
2. Table structure changed
3. CSS classes changed

**Debug**: Run with `--debug` flag to step through:
```bash
npm run test:e2e:debug
```

### Test Fails: "Amount mismatch"
**Possible causes**:
1. Currency formatting differs
2. Rounding issues

**Check**: The test allows differences < 1. Review `normalizeMoney()` function.

### Test Fails: "Status mismatch"
**Possible causes**:
1. Backend returns "PENDING_APPROVAL", frontend displays "Pending Approval"
2. Status badge formatting

**Check**: Review `normalizeStatus()` function which removes underscores, hyphens, spaces.

## Viewing Results

### Screenshots (on failure)
```
test-results/loans-table-spec-*.png
```

### Videos (on failure)
```
test-results/*/video.webm
```

### HTML Report
```bash
npx playwright show-report
```

## Continuous Integration

For CI environments:
```bash
export CI=true
export FRONTEND_BASE_URL=http://localhost:3000
export BACKEND_BASE_URL=http://localhost:8081/api

# Run tests
npm run test:e2e
```

## Extending Tests

### Add New Page

Edit `tests/e2e/loans-table.spec.ts`:

```typescript
const testCases: PageCase[] = [
  // ... existing cases
  {
    name: 'My New Page',
    route: '/loans/my-page',
    apiPath: '/loans/my-endpoint',
    expectedColumns: 7,
    itemsPerPage: 5,
  },
];
```

### Add Custom Assertions

Create new functions in `utils/assertions.ts`:

```typescript
export async function expectCustomBehavior(page: Page) {
  // Your custom assertions
}
```

## Troubleshooting

### Enable Verbose Logging

The tests include console.log statements showing:
- API fetch results
- Page navigation
- Row-by-row comparison

Watch the console output during test execution.

### Inspect Playwright Trace

On failure, view the trace:
```bash
npx playwright show-trace test-results/.../trace.zip
```

### Run Single Test

```bash
npx playwright test tests/e2e/loans-table.spec.ts -g "Pending Approvals"
```

## Performance

- **Single test duration**: ~10-15 seconds
- **Full suite**: ~30-45 seconds (3 pages)
- **With pagination tests**: +5-10 seconds per page with > 5 items

## Maintenance

When backend DTO changes:
1. Update `LoanResponse` interface in `utils/api.ts`
2. Update field comparisons in `loans-table.spec.ts`

When frontend table structure changes:
1. Update selectors in `utils/selectors.ts`
2. Update column expectations in test cases

## Success Criteria

All tests pass when:
- ✅ Every visible table cell matches corresponding API field
- ✅ Pagination shows correct row counts
- ✅ Column headers are present
- ✅ Empty state shown when no data
- ✅ Cross-page consistency validated
