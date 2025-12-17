# Quick Start - Loan Edit E2E Testing

## 🚀 Run Tests in 3 Steps

### Step 1: Start Backend & Frontend
```bash
# Terminal 1: Backend
cd backend && ./mvnw spring-boot:run

# Terminal 2: Frontend  
cd frontend && npm start
```

### Step 2: Run Tests
```bash
# Terminal 3: Tests
cd frontend
npm run test:e2e:loan-edit
```

### Step 3: View Results
```bash
npx playwright show-report
```

---

## 🎯 Quick Commands

| Command | Purpose |
|---------|---------|
| `npm run test:e2e:loan-edit` | Run tests (headless) |
| `npm run test:e2e:loan-edit:headed` | Run with visible browser |
| `npm run test:e2e:loan-edit:debug` | Debug step-by-step |
| `./run-loan-edit-tests.sh headed` | Run via shell script |

---

## ✅ What Gets Tested

✅ Edit button visibility on all tables  
✅ Navigation to edit page  
✅ Form prefilling with data  
✅ Step-by-step validation  
✅ Complete update flow  
✅ Backend verification  
✅ Error handling  

**Total: 13 tests in ~45 seconds**

---

## 🔍 Viewing Results

### HTML Report
```bash
npx playwright show-report
```

### Screenshots (on failure)
```bash
ls test-results/
```

### Traces (detailed debugging)
```bash
npx playwright show-trace test-results/.../trace.zip
```

---

## 🐛 If Tests Fail

1. **Check servers are running**
   ```bash
   curl http://localhost:3000
   curl http://localhost:8081/api/loans
   ```

2. **Check database has loans**
   - Backend needs at least 1 loan
   - Loan should be in OPEN status

3. **View detailed logs**
   - Check test output in terminal
   - Open HTML report
   - Check screenshots in test-results/

4. **Run in debug mode**
   ```bash
   npm run test:e2e:loan-edit:debug
   ```

---

## 📊 Test Results

Expected output:
```
Running 13 tests using 1 worker

✓ [chromium] › loan-edit.spec.ts:31:3 › should display Edit button...
✓ [chromium] › loan-edit.spec.ts:62:3 › should display Edit button...
✓ [chromium] › loan-edit.spec.ts:93:3 › should NOT display Edit button...
✓ [chromium] › loan-edit.spec.ts:120:3 › should navigate to Edit page...
✓ [chromium] › loan-edit.spec.ts:152:3 › should prefill form...
✓ [chromium] › loan-edit.spec.ts:187:3 › should validate form...
✓ [chromium] › loan-edit.spec.ts:219:3 › should successfully update...
✓ [chromium] › loan-edit.spec.ts:282:3 › should reflect changes...
✓ [chromium] › loan-edit.spec.ts:346:3 › should show loading state...
✓ [chromium] › loan-edit.spec.ts:376:3 › should navigate back...
✓ [chromium] › loan-edit.spec.ts:408:3 › should display stepper...
✓ [chromium] › loan-edit.spec.ts:447:3 › should handle invalid ID...
✓ [chromium] › loan-edit.spec.ts:468:3 › should prevent duplicate...

13 passed (45s)
```

---

## 📚 More Info

- **Detailed docs**: `tests/e2e/LOAN_EDIT_TESTS.md`
- **Implementation**: `LOAN_EDIT_IMPLEMENTATION.md`
- **Test file**: `tests/e2e/loan-edit.spec.ts`

---

**Ready to test?** Run: `npm run test:e2e:loan-edit` 🚀
