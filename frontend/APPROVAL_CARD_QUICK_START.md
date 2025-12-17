# Approval Card System - Quick Start Guide

## 🚀 Quick Test Commands

```bash
# Run all approval card tests (headless)
npm run test:e2e:approval

# Run with visible browser
npm run test:e2e:approval:headed

# Debug mode (slower, with pauses)
npm run test:e2e:approval:debug
```

---

## 📋 What Gets Tested

|| Test # | Test Name | What It Checks |
||--------|-----------|----------------|
|| 1 | Display ApprovalCard | Card shows for pending loan |
|| 2 | Approve Loan | Approve button works, status updates |
|| 3 | Reject Loan | Reject with reason, status updates |
|| 4 | Approved Card | Green card displays correctly |
|| 5 | Rejected Card | Red card with reason displays |
|| 6 | Button States | Buttons disable during processing |
|| 7 | WebSocket Sync | Real-time updates across tabs |
|| 8 | Approval Info | Approver name/date show |
|| 9 | Cancel Rejection | Graceful cancellation handling |
|| 10 | Styling | Gradient backgrounds correct |
|| 11 | Responsive | Mobile view works |
|| 12 | Toast Notifications | Success and error toasts show |

---

## 🎯 How to Use (End Users)

### Approve a Loan
1. Open loan details page (loan must be PENDING_APPROVAL)
2. Review loan info in yellow ApprovalCard
3. Click **✓ Approve Loan** button
4. Card turns green → Loan approved!

### Reject a Loan
1. Open loan details page (loan must be PENDING_APPROVAL)
2. Review loan info in yellow ApprovalCard
3. Click **✗ Reject Loan** button
4. Enter rejection reason in prompt
5. Card turns red → Loan rejected with reason displayed

---

## 🎨 Visual States

| State | Color | Icon | Buttons |
|-------|-------|------|---------|
| **PENDING_APPROVAL** | Yellow/Amber gradient | ⚠️ | ✓ Approve • ✗ Reject |
| **APPROVED** | Green gradient | ✓ | None |
| **REJECTED** | Red gradient | ✗ | None |

---

## 🔧 Component Integration

### Basic Usage
```jsx
import ApprovalCard from '../../components/Loans/ApprovalCard';

<ApprovalCard 
  loan={loan}
  workflowStatus={loan.workflowStatus}
  onApprove={handleApprove}
  onReject={handleReject}
/>
```

### With Approval Metadata
```jsx
<ApprovalCard 
  loan={loan}
  workflowStatus="APPROVED"
  approvedBy="John Doe"
  approvedAt="2025-11-12T14:30:00Z"
/>
```

### With Rejection Metadata
```jsx
<ApprovalCard 
  loan={loan}
  workflowStatus="REJECTED"
  rejectedBy="Jane Smith"
  rejectedAt="2025-11-12T14:30:00Z"
  rejectionReason="Insufficient documentation"
/>
```

---

## 🐛 Quick Troubleshooting

### Card Not Showing
```bash
# Check if loan has correct workflowStatus
curl http://localhost:8081/api/loans/1 | grep workflowStatus
# Should be: PENDING_APPROVAL, APPROVED, or REJECTED
```

### Approve Button Not Working
1. Check browser console (F12) for errors
2. Verify backend is running: `curl http://localhost:8081/actuator/health`
3. Check loan ID is valid

### WebSocket Not Updating
1. Check WebSocket connection in Network tab (WS/Stomp)
2. Verify backend WebSocket endpoint is running
3. Check console for WebSocket connection messages

---

## 📊 Test Execution

### Expected Results
- **Total Tests**: 12
- **Duration**: ~30-45 seconds
- **Pass Rate**: 100%

### Test Phases
1. **Setup** (5s): Login, navigate to loans
2. **Display Tests** (10s): Verify cards render correctly
3. **Action Tests** (15s): Test approve/reject functionality
4. **WebSocket Tests** (10s): Verify real-time updates
5. **UI Tests** (5s): Check styling and responsive design

---

## 🔄 WebSocket Real-Time Updates

When another user approves/rejects a loan:
1. Backend broadcasts WebSocket message
2. Your page receives update automatically
3. ApprovalCard refreshes with new state
4. No page reload needed!

**Test this**: Open two browser tabs with same loan, approve in one tab → other tab updates instantly.

---

## 📁 Key Files

| File | Purpose | Lines |
|------|---------|-------|
| `src/components/Loans/ApprovalCard.jsx` | Main component | 249 |
| `src/components/Loans/ApprovalCard.css` | Gradient styling | 386 |
| `tests/e2e/loan-approval.spec.ts` | E2E tests | 480 |
| `src/pages/Loans/LoanDetails.jsx` | Integration point | Modified |

---

## 🎯 API Endpoints

### Approve Loan
```bash
POST http://localhost:8081/api/loans/1/approve
Content-Type: application/json

{
  "approvedBy": 1
}
```

### Reject Loan
```bash
POST http://localhost:8081/api/loans/1/reject
Content-Type: application/json

{
  "rejectedBy": 1,
  "reason": "Insufficient documentation"
}
```

---

## ✅ Pre-Flight Checklist

Before running tests:
- [ ] Backend is running on port 8081
- [ ] Frontend is running on port 3000
- [ ] Test user credentials work (admin@example.com / password)
- [ ] Database has loans with different statuses
- [ ] WebSocket connection is active

---

## 🎓 Common Test Patterns

### Test a Pending Loan
```typescript
await page.goto('http://localhost:3000/loans/1');
await expect(page.getByTestId('approval-card-pending')).toBeVisible();
```

### Test Approve Action
```typescript
await page.getByTestId('approve-button').click();
await expect(page.getByText(/approved successfully/i)).toBeVisible();
```

### Test Reject Action
```typescript
page.once('dialog', dialog => dialog.accept('Test rejection reason'));
await page.getByTestId('reject-button').click();
```

### Verify Backend Status
```typescript
const response = await request.get(`http://localhost:8081/api/loans/1`);
const loan = await response.json();
expect(loan.workflowStatus).toBe('APPROVED');
```

---

## 📈 Performance Tips

### For Faster Test Runs
1. Use headless mode: `npm run test:e2e:approval`
2. Run single test: `npx playwright test -g "should approve"`
3. Disable animations in test mode (if needed)

### For Debugging
1. Use headed mode: `npm run test:e2e:approval:headed`
2. Add breakpoints in test file
3. Use debug mode: `npm run test:e2e:approval:debug`
4. Check screenshots in `test-results/` folder

---

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Yellow card displays for pending loans
- ✅ Approve button changes card to green
- ✅ Reject button changes card to red with reason
- ✅ All 12 tests pass
- ✅ WebSocket updates work across tabs
- ✅ Toast notifications appear
- ✅ Backend audit logs are created

---

## 📞 Need Help?

### Check These First
1. **Full Documentation**: `APPROVAL_CARD_IMPLEMENTATION.md`
2. **Test Output**: Check terminal for detailed error messages
3. **Browser Console**: F12 → Console tab for errors
4. **Backend Logs**: Check backend terminal for API errors

### Common Issues
- **Card not showing**: Check `workflowStatus` value
- **Tests failing**: Ensure backend is running
- **WebSocket not working**: Check Network tab for WS connection
- **Styling broken**: Clear browser cache and restart dev server

---

**Quick Start Version**: 1.0.0  
**Last Updated**: November 12, 2025  
**See Also**: [Full Implementation Guide](./APPROVAL_CARD_IMPLEMENTATION.md)
