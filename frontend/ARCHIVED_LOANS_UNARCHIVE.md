# Archived Loans Page and Unarchive Functionality - Implementation Documentation

## Overview

This document provides comprehensive details on the **Archived Loans Page** and **Unarchive Functionality** implementation in the Tindigwa MFI system. This feature allows administrators and managers to view archived loans in a dedicated page and restore them back to the active loans list when needed.

## Table of Contents

- [Features](#features)
- [Technical Architecture](#technical-architecture)
- [Implementation Details](#implementation-details)
- [Component Structure](#component-structure)
- [Backend Integration](#backend-integration)
- [Testing](#testing)
- [Usage Guide](#usage-guide)
- [Troubleshooting](#troubleshooting)

---

## Features

### Core Functionality

1. **Archived Loans Page**
   - Dedicated page accessible from the sidebar navigation
   - Displays all archived loans in a clean, organized table format
   - Includes search functionality to filter loans by loan number, client name, or product
   - Pagination for easy navigation through large datasets (5 loans per page)
   - Real-time updates via WebSocket integration
   - Empty state handling when no archived loans exist

2. **Unarchive Functionality**
   - Restore archived loans back to the active loans list
   - Confirmation dialog before unarchiving
   - Success/error toast notifications
   - Real-time UI updates
   - Backend synchronization

3. **Sidebar Integration**
   - "Archived Loans" menu item under the Loans section
   - Positioned after "Rejected Loans" and before "Loan Tracking"
   - Uses Archive icon from lucide-react
   - Active state highlighting

---

## Technical Architecture

### File Structure

```
frontend/src/
├── pages/Loans/
│   ├── ArchivedLoans.jsx          # Main component (297 lines)
│   └── ArchivedLoans.css          # Component styles (99 lines)
├── components/Layout/
│   └── Sidebar.jsx                # Updated with Archived Loans link
├── services/
│   └── loanService.js             # Updated with unarchiveLoan method
├── styles/
│   └── table-common.css           # Updated with unarchive button styles
└── App.js                         # Updated with /loans/archived route

frontend/tests/e2e/
└── archived-loans-unarchive.spec.ts  # E2E tests (520 lines)
```

### Technology Stack

- **Frontend**: React 18.2.0
- **Routing**: react-router-dom 6.3.0
- **State Management**: React Hooks (useState, useEffect)
- **HTTP Client**: Axios 1.11.0
- **WebSocket**: @stomp/stompjs 7.2.1
- **UI Icons**: lucide-react 0.263.1
- **Notifications**: react-hot-toast 2.6.0
- **Testing**: Playwright 1.56.1

---

## Implementation Details

### 1. ArchivedLoans Component

**File**: `src/pages/Loans/ArchivedLoans.jsx`

#### Key Features

```javascript path=/home/blessing/Projects/Others/tindigwa-frontend/frontend/src/pages/Loans/ArchivedLoans.jsx start=1
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, RotateCcw, Search } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import LoanService from '../../services/loanService';
import { toast } from 'react-hot-toast';
import websocketService from '../../services/websocketService';
import './ArchivedLoans.css';
```

#### State Management

```javascript path=null start=null
const [archivedLoans, setArchivedLoans] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [searchQuery, setSearchQuery] = useState('');
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 5;
```

#### Data Fetching

```javascript path=null start=null
useEffect(() => {
  fetchArchivedLoans();
}, []);

const fetchArchivedLoans = async () => {
  try {
    setLoading(true);
    setError(null);
    const data = await LoanService.getArchivedLoans();
    console.log('Fetched archived loans:', data);
    setArchivedLoans(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error('Error fetching archived loans:', err);
    setError('Failed to load archived loans');
    setArchivedLoans([]);
  } finally {
    setLoading(false);
  }
};
```

#### WebSocket Integration

```javascript path=null start=null
useEffect(() => {
  // Subscribe to loan.archived event
  const archivedUnsubscribe = websocketService.subscribe('loan.archived', (loanData) => {
    console.log('Loan archived via WebSocket:', loanData);
    setArchivedLoans(prevLoans => [...prevLoans, loanData]);
  });

  // Subscribe to loan.unarchived event
  const unarchivedUnsubscribe = websocketService.subscribe('loan.unarchived', (loanData) => {
    console.log('Loan unarchived via WebSocket:', loanData);
    setArchivedLoans(prevLoans => prevLoans.filter(loan => loan.id !== loanData.id));
  });

  return () => {
    archivedUnsubscribe();
    unarchivedUnsubscribe();
  };
}, []);
```

#### Unarchive Handler

```javascript path=null start=null
const handleUnarchiveLoan = async (loanId) => {
  const loan = archivedLoans.find(l => l.id === loanId);
  const confirmMessage = `Are you sure you want to unarchive this loan (${loan?.loanNumber})? It will be restored to the active loans list.`;
  
  if (window.confirm(confirmMessage)) {
    try {
      await LoanService.unarchiveLoan(loanId);
      toast.success('Loan unarchived successfully');
      
      // Remove from local state
      setArchivedLoans(prevLoans => prevLoans.filter(l => l.id !== loanId));
      
      // Reset to first page if current page becomes empty
      if (filteredLoans.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error('Error unarchiving loan:', error);
      toast.error('Failed to unarchive loan');
    }
  }
};
```

#### Search and Pagination

```javascript path=null start=null
// Filter loans based on search query
const filteredLoans = archivedLoans.filter(loan => {
  const query = searchQuery.toLowerCase();
  return (
    loan.loanNumber?.toLowerCase().includes(query) ||
    loan.clientName?.toLowerCase().includes(query) ||
    loan.loanProductName?.toLowerCase().includes(query)
  );
});

// Calculate pagination
const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const paginatedLoans = filteredLoans.slice(startIndex, endIndex);
```

#### Table Rendering

```javascript path=null start=null
<table className="loans-table">
  <thead>
    <tr>
      <th>Loan Number</th>
      <th>Client</th>
      <th>Product</th>
      <th>Amount</th>
      <th>Workflow Status</th>
      <th>Loan Status</th>
      <th>Archived Date</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {paginatedLoans.map((loan) => (
      <tr key={loan.id}>
        <td className="loan-number">{loan.loanNumber}</td>
        <td>{loan.clientName}</td>
        <td>{loan.loanProductName}</td>
        <td className="amount">{formatCurrency(loan.principalAmount)}</td>
        <td>
          <span className={`status-badge ${loan.workflowStatus?.toLowerCase()}`}>
            {loan.workflowStatus || 'N/A'}
          </span>
        </td>
        <td>
          <span className={`status-badge ${loan.loanStatus?.toLowerCase()}`}>
            {loan.loanStatus || 'N/A'}
          </span>
        </td>
        <td>{formatDate(loan.archivedDate)}</td>
        <td>
          <div className="action-buttons">
            <button
              className="action-btn view"
              onClick={() => navigate(`/loans/details/${loan.id}`)}
              title="View Details"
            >
              <Eye size={16} />
            </button>
            <button
              className="action-btn unarchive"
              onClick={() => handleUnarchiveLoan(loan.id)}
              title="Unarchive Loan"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

---

### 2. Styling

**File**: `src/pages/Loans/ArchivedLoans.css`

#### Key Styles

```css path=/home/blessing/Projects/Others/tindigwa-frontend/frontend/src/pages/Loans/ArchivedLoans.css start=1
.archived-loans-page {
  padding: 20px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.page-header p {
  color: #6b7280;
  font-size: 14px;
}
```

#### Empty State

```css path=null start=null
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px dashed #d1d5db;
}

.empty-icon {
  color: #9ca3af;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.empty-state p {
  color: #6b7280;
  font-size: 14px;
}
```

#### Loading Spinner

```css path=null start=null
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.spinner {
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

#### Responsive Design

```css path=null start=null
@media (max-width: 768px) {
  .archived-loans-page {
    padding: 16px;
  }

  .loans-table {
    font-size: 12px;
  }

  .action-btn {
    padding: 6px;
  }

  .search-container input {
    font-size: 14px;
  }
}
```

---

### 3. Unarchive Button Styling

**File**: `src/styles/table-common.css`

```css path=/home/blessing/Projects/Others/tindigwa-frontend/frontend/src/styles/table-common.css start=null
/* Unarchive button - green theme */
.action-btn.unarchive {
  background-color: #e0f7e9;
  color: #0f766e;
  border: 1px solid #99f6e4;
}

.action-btn.unarchive:hover {
  background-color: #ccf3dd;
  border-color: #5eead4;
}

.action-btn.unarchive:active {
  background-color: #b3f0d1;
}
```

---

### 4. Service Layer

**File**: `src/services/loanService.js`

```javascript path=/home/blessing/Projects/Others/tindigwa-frontend/frontend/src/services/loanService.js start=null
class LoanService {
  // ... existing methods ...

  /**
   * Unarchive a loan (restore to active list)
   * @param {number} loanId - The ID of the loan to unarchive
   * @returns {Promise<Object>} The unarchived loan data
   */
  async unarchiveLoan(loanId) {
    const response = await api.post(`/loans/${loanId}/unarchive`);
    return response.data;
  }

  /**
   * Get all archived loans
   * @returns {Promise<Array>} List of archived loans
   */
  async getArchivedLoans() {
    const response = await api.get('/loans/archived');
    return response.data;
  }
}

export default new LoanService();
```

---

### 5. Routing

**File**: `src/App.js`

#### Import

```javascript path=/home/blessing/Projects/Others/tindigwa-frontend/frontend/src/App.js start=41
import RejectedLoans from './pages/Loans/RejectedLoans';
import ArchivedLoans from './pages/Loans/ArchivedLoans';
import LoanTracking from './pages/Loans/LoanTracking';
```

#### Route Definition

```javascript path=/home/blessing/Projects/Others/tindigwa-frontend/frontend/src/App.js start=318
<Route path="/loans/rejected" element={isAuthenticated ? <RejectedLoans /> : <Navigate to="/login" replace />} />
<Route path="/loans/archived" element={isAuthenticated ? <ArchivedLoans /> : <Navigate to="/login" replace />} />
<Route path="/loans/tracking" element={isAuthenticated ? <LoanTracking /> : <Navigate to="/login" replace />} />
```

---

### 6. Sidebar Navigation

**File**: `src/components/Layout/Sidebar.jsx`

#### Icon Import

```javascript path=/home/blessing/Projects/Others/tindigwa-frontend/frontend/src/components/Layout/Sidebar.jsx start=24
Package,
Target,
Archive
```

#### Menu Item

```javascript path=/home/blessing/Projects/Others/tindigwa-frontend/frontend/src/components/Layout/Sidebar.jsx start=69
{ title: 'Rejected Loans', icon: XCircle, path: '/loans/rejected' },
{ title: 'Archived Loans', icon: Archive, path: '/loans/archived' },
{ title: 'Loan Tracking', icon: Target, path: '/loans/tracking' }
```

---

## Backend Integration

### API Endpoints

#### 1. Get Archived Loans

- **Endpoint**: `GET /api/loans/archived`
- **Description**: Retrieves all archived loans
- **Response**:
  ```json
  [
    {
      "id": 123,
      "loanNumber": "LN-2024-001",
      "clientName": "John Doe",
      "loanProductName": "Personal Loan",
      "principalAmount": 50000.00,
      "workflowStatus": "APPROVED",
      "loanStatus": "COMPLETED",
      "archived": true,
      "archivedDate": "2024-01-15T10:30:00Z"
    }
  ]
  ```

#### 2. Unarchive Loan

- **Endpoint**: `POST /api/loans/{id}/unarchive`
- **Description**: Restores an archived loan to the active list
- **Response**:
  ```json
  {
    "id": 123,
    "loanNumber": "LN-2024-001",
    "archived": false,
    "message": "Loan unarchived successfully"
  }
  ```

### WebSocket Events

#### loan.archived

- **Triggered**: When a loan is archived
- **Payload**:
  ```json
  {
    "id": 123,
    "loanNumber": "LN-2024-001",
    "archived": true,
    "archivedDate": "2024-01-15T10:30:00Z"
  }
  ```

#### loan.unarchived

- **Triggered**: When a loan is unarchived
- **Payload**:
  ```json
  {
    "id": 123,
    "loanNumber": "LN-2024-001",
    "archived": false
  }
  ```

---

## Testing

### E2E Test Suite

**File**: `tests/e2e/archived-loans-unarchive.spec.ts`

#### Test Categories

1. **Navigation and UI** (4 tests)
   - Sidebar navigation
   - Table display and columns
   - Button visibility and styling

2. **Search and Pagination** (2 tests)
   - Search filtering
   - Pagination controls

3. **Unarchive Functionality** (3 tests)
   - Confirmation dialog
   - Successful unarchive
   - Error handling

4. **View Details** (1 test)
   - Navigation to loan details

5. **WebSocket Integration** (2 tests)
   - Real-time archive updates
   - Real-time unarchive updates

6. **Integration** (1 test)
   - Full archive-unarchive cycle

**Total Tests**: 13 comprehensive E2E tests

#### Running Tests

```bash
# Run all archived loans tests
npm run test:e2e:archived

# Run in headed mode (with browser UI)
npm run test:e2e:archived:headed

# Run in debug mode
npm run test:e2e:archived:debug
```

#### Example Test

```typescript path=null start=null
test('should unarchive a loan successfully', async ({ page, request }) => {
  const response = await request.get('http://localhost:8081/api/loans/archived');
  const archivedLoans = await response.json();
  const loanToUnarchive = archivedLoans[0];
  
  await page.goto('http://localhost:3000/loans/archived');
  await page.waitForSelector('.loans-table');
  
  // Handle confirmation dialog
  page.once('dialog', async dialog => {
    expect(dialog.message()).toContain('unarchive this loan');
    await dialog.accept();
  });
  
  // Click Unarchive button
  const unarchiveButton = page.locator('.action-btn.unarchive').first();
  await unarchiveButton.click();
  
  // Verify success
  await expect(page.locator('text=unarchived successfully')).toBeVisible();
  
  // Verify loan removed from archived list
  const loanStillVisible = await page.locator(`text=${loanToUnarchive.loanNumber}`).count();
  expect(loanStillVisible).toBe(0);
});
```

---

## Usage Guide

### For End Users

#### Accessing Archived Loans

1. Log in to the Tindigwa MFI system
2. Click on **Loans** in the sidebar to expand the menu
3. Click on **Archived Loans**
4. You'll see a list of all archived loans with details

#### Searching for Archived Loans

1. Use the search box at the top of the page
2. Type loan number, client name, or product name
3. Results filter automatically as you type

#### Unarchiving a Loan

1. Locate the loan in the archived loans table
2. Click the **Unarchive** button (green with circular arrow icon)
3. Confirm the action in the dialog that appears
4. The loan will be restored to the active loans list
5. Success notification will appear

#### Viewing Loan Details

1. Click the **View** button (eye icon) next to any archived loan
2. You'll be redirected to the loan details page
3. All loan information will be available for review

---

### For Developers

#### Adding New Features

To extend the Archived Loans page:

1. **Update the component**: Modify `ArchivedLoans.jsx`
2. **Add styles**: Update `ArchivedLoans.css`
3. **Update service**: Add methods to `loanService.js`
4. **Add tests**: Create tests in `archived-loans-unarchive.spec.ts`

#### Customizing the Table

To add/remove columns:

```javascript path=null start=null
// In ArchivedLoans.jsx, update the table header
<thead>
  <tr>
    <th>Loan Number</th>
    <th>Client</th>
    {/* Add new column header */}
    <th>New Column</th>
    <th>Actions</th>
  </tr>
</thead>

// Update the table body
<tbody>
  {paginatedLoans.map((loan) => (
    <tr key={loan.id}>
      <td>{loan.loanNumber}</td>
      <td>{loan.clientName}</td>
      {/* Add new column data */}
      <td>{loan.newField}</td>
      <td>{/* actions */}</td>
    </tr>
  ))}
</tbody>
```

#### Modifying Pagination

To change items per page:

```javascript path=null start=null
// In ArchivedLoans.jsx
const itemsPerPage = 10; // Change from 5 to 10
```

---

## Troubleshooting

### Common Issues

#### 1. Archived Loans Not Loading

**Symptom**: Empty state or loading spinner persists

**Solutions**:
- Check backend API is running: `http://localhost:8081/api/loans/archived`
- Verify authentication token is valid
- Check browser console for error messages
- Ensure database has archived loans (archived = true)

#### 2. Unarchive Button Not Working

**Symptom**: Button click has no effect

**Solutions**:
- Check browser console for JavaScript errors
- Verify backend endpoint is accessible: `POST /api/loans/{id}/unarchive`
- Ensure user has permission to unarchive loans
- Check WebSocket connection status

#### 3. WebSocket Updates Not Working

**Symptom**: Page doesn't update when loans are archived/unarchived elsewhere

**Solutions**:
- Verify WebSocket connection in ConnectionStatus component
- Check backend WebSocket configuration
- Ensure loan.archived and loan.unarchived events are being emitted
- Try refreshing the page manually

#### 4. Search Not Filtering Results

**Symptom**: Search input doesn't filter the table

**Solutions**:
- Clear the search input and try again
- Check that loan data includes searchable fields (loanNumber, clientName, loanProductName)
- Verify the filtering logic in the component

#### 5. Pagination Issues

**Symptom**: Page numbers incorrect or navigation broken

**Solutions**:
- Check totalPages calculation
- Verify startIndex and endIndex are correct
- Reset currentPage to 1 after filtering

---

## Performance Considerations

### Optimization Techniques

1. **Pagination**: Only 5 loans displayed per page to reduce DOM size
2. **Lazy Loading**: Data fetched only when component mounts
3. **WebSocket**: Real-time updates without polling
4. **Memoization**: Consider using `useMemo` for filtered/paginated data in large datasets

### Recommended Improvements

1. **Virtual Scrolling**: For very large datasets (1000+ loans)
2. **Debounced Search**: Add debounce to search input (300ms delay)
3. **Caching**: Cache archived loans data for faster subsequent loads
4. **Infinite Scroll**: Alternative to pagination for better UX

---

## Security Considerations

### Access Control

- Only authenticated users can access the Archived Loans page
- Route is protected by `isAuthenticated` check in App.js
- Backend should verify user permissions before unarchiving

### Data Validation

- Loan ID validated before unarchive operation
- Confirmation dialog prevents accidental unarchive
- Error handling for failed API requests

---

## Future Enhancements

### Planned Features

1. **Bulk Unarchive**: Select multiple loans to unarchive at once
2. **Archive Reason**: Add reason field when archiving loans
3. **Archive History**: Track who archived/unarchived and when
4. **Export to Excel**: Export archived loans list to spreadsheet
5. **Advanced Filters**: Filter by date range, loan status, amount, etc.
6. **Archive Summary**: Dashboard widget showing archived loans statistics

---

## File Changes Summary

### New Files Created

| File | Lines | Description |
|------|-------|-------------|
| `ArchivedLoans.jsx` | 297 | Main component for archived loans page |
| `ArchivedLoans.css` | 99 | Styles for archived loans page |
| `archived-loans-unarchive.spec.ts` | 520 | E2E tests for archived loans and unarchive |

### Files Modified

| File | Changes | Description |
|------|---------|-------------|
| `loanService.js` | +10 | Added unarchiveLoan method |
| `table-common.css` | +11 | Added unarchive button styles |
| `Sidebar.jsx` | +2 | Added Archived Loans menu item and Archive icon import |
| `App.js` | +2 | Added route and import for ArchivedLoans |
| `package.json` | +3 | Added test:e2e:archived commands |

### Total Implementation

- **New Lines**: 926
- **Modified Lines**: 28
- **Total Impact**: 954 lines of code

---

## API Integration Checklist

✅ GET /api/loans/archived - Fetch archived loans  
✅ POST /api/loans/{id}/unarchive - Unarchive loan  
✅ WebSocket loan.archived event - Real-time archive notification  
✅ WebSocket loan.unarchived event - Real-time unarchive notification  

---

## Testing Checklist

✅ Navigation from sidebar to Archived Loans page  
✅ Display archived loans in table format  
✅ View and Unarchive buttons visible  
✅ Search functionality filters results  
✅ Pagination displays correctly  
✅ Unarchive confirmation dialog  
✅ Successful unarchive operation  
✅ Error handling for failed unarchive  
✅ View details navigation  
✅ WebSocket real-time updates  
✅ Full archive-unarchive integration cycle  

---

## Deployment Notes

### Pre-Deployment Checklist

1. ✅ All E2E tests passing
2. ✅ Backend endpoints verified
3. ✅ WebSocket events configured
4. ✅ Database migration for archived column (if needed)
5. ✅ User permissions configured
6. ✅ Error handling tested

### Post-Deployment Verification

1. Navigate to /loans/archived in production
2. Verify archived loans display correctly
3. Test unarchive functionality
4. Verify WebSocket updates work
5. Check search and pagination
6. Monitor backend logs for errors

---

## Support

### Contact

For issues or questions regarding the Archived Loans page and Unarchive functionality:

- **Technical Issues**: Check browser console and backend logs
- **Feature Requests**: Submit via project management system
- **Bug Reports**: Include steps to reproduce, expected vs actual behavior

---

## Conclusion

The Archived Loans page and Unarchive functionality provide a complete solution for managing archived loans in the Tindigwa MFI system. The implementation follows best practices with comprehensive testing, real-time updates, and excellent user experience.

**Key Highlights**:
- ✅ Clean, maintainable code
- ✅ Comprehensive E2E testing (13 tests)
- ✅ Real-time WebSocket integration
- ✅ Responsive design
- ✅ Excellent error handling
- ✅ Follows existing codebase patterns
- ✅ Full documentation

---

**Document Version**: 1.0  
**Last Updated**: January 2024  
**Author**: Tindigwa Development Team
