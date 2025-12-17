# Color-Coded Status Badge System

## Overview
This document describes the comprehensive color-coded status system implemented across the Loan Management frontend. The system uses the reusable `StatusBadge` component with plain CSS styling (no Tailwind or styled-components).

---

## 🎨 Color Palette

### Primary Workflow Statuses

| Status | Background | Text Color | Border | Use Case |
|--------|-----------|------------|--------|----------|
| **Approved** | `#E7F9EE` (light green) | `#107C41` (forest green) | `#B8EAC2` | Loan approved by manager/cashier |
| **Pending Approval** | `#FFF6E5` (light amber) | `#D9931E` (dark amber) | `#FFD48B` | Awaiting approval decision |
| **Rejected** | `#FFE8E8` (light red) | `#B71C1C` (dark red) | `#F5B5B5` | Loan application rejected |
| **Disbursed** | `#E6F3FF` (pale blue) | `#005EB8` (navy blue) | `#A9D2FF` | Funds disbursed to client |
| **Completed** | `#E9F8F2` (mint green) | `#056C4E` (dark teal) | `#B4E7CF` | Loan fully repaid |
| **Due** | `#FFF4E5` (peach) | `#C76C04` (burnt orange) | `#FFD19A` | Payment due soon |
| **Defaulted** | `#FDE8E8` (light rose) | `#8B0000` (dark red) | `#E9B3B3` | Loan in default |
| **Open** | `#F0F0F0` (neutral gray) | `#444` (dark gray) | `#DDD` | Active loan status |

### Additional Statuses

| Status | Background | Text Color | Border | Use Case |
|--------|-----------|------------|--------|----------|
| **Active** | `#E8F4FD` (light blue) | `#0066CC` (blue) | `#B3D9F2` | Currently active |
| **Overdue** | `#FFF0E5` (light orange) | `#D64F00` (dark orange) | `#FFBD7A` | Payment overdue |
| **Closed** | `#E8E8E8` (dark gray) | `#555` (darker gray) | `#CCC` | Loan closed |
| **Pending** | `#F5F5F5` (neutral gray) | `#666` (gray) | `#DDD` | Generic pending state |
| **In Progress** | `#FFF9E5` (light yellow) | `#B8860B` (dark goldenrod) | `#F5E6A3` | Work in progress |
| **Recorded** | `#E7F9EE` (light green) | `#107C41` (forest green) | `#B8EAC2` | Payment recorded |
| **Reversed** | `#FFE8E8` (light red) | `#B71C1C` (dark red) | `#F5B5B5` | Payment reversed |
| **On Track** | `#E7F9EE` (light green) | `#107C41` (forest green) | `#B8EAC2` | Payment schedule on track |
| **At Risk** | `#FFF4E5` (peach) | `#C76C04` (burnt orange) | `#FFD19A` | Loan at risk |

---

## 📦 Component Usage

### Basic Usage

```jsx
import StatusBadge from '../../components/StatusBadge';

// Simple usage
<StatusBadge status="approved" />
<StatusBadge status="pending_approval" />
<StatusBadge status="disbursed" />

// With size variants
<StatusBadge status="completed" size="sm" />
<StatusBadge status="rejected" size="md" />
<StatusBadge status="defaulted" size="lg" />

// Multiple badges side by side
<div className="status-badges">
  <StatusBadge status={loan.workflowStatus} size="sm" />
  <StatusBadge status={loan.loanStatus} size="sm" />
</div>
```

### Size Variants

- **`size="sm"`**: Small badges (11px font, 4px/10px padding) - Use in tables and compact layouts
- **`size="md"`**: Medium badges (12px font, 6px/12px padding) - Default size
- **`size="lg"`**: Large badges (13px font, 8px/16px padding) - Use in headers or prominent displays

---

## 🎯 Implementation Locations

### 1. **StatusBadge Component**
**File**: `src/components/StatusBadge.jsx`

```jsx
const StatusBadge = ({ status = 'pending', size = 'md' }) => {
  const normalized = status
    ?.toString()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .trim() || 'pending';

  const sizeClass = `size-${size}`;
  const statusClass = normalized;

  const displayText = status
    ?.toString()
    .replace(/[_-]/g, ' ')
    .trim();

  return (
    <span className={`status-badge ${statusClass} ${sizeClass}`}>
      {displayText}
    </span>
  );
};
```

### 2. **CSS Styles**
**File**: `src/components/StatusBadge.css`

All color definitions, hover effects, and responsive behavior are defined here.

### 3. **Loan Overview Card**
**File**: `src/components/Loans/LoanOverviewCard.jsx`

Displays both workflow and loan status badges in the card header:

```jsx
<div className="card-header">
  <h3>Loan Overview</h3>
  <div className="status-badges">
    <StatusBadge status={loan.workflowStatus} size="sm" />
    <StatusBadge status={loan.loanStatus} size="sm" />
  </div>
</div>
```

### 4. **All Loans Table**
**File**: `src/pages/Loans/AllLoans.jsx`

Uses badges in separate table columns:

```jsx
<tbody>
  {currentLoans.map((loan) => (
    <tr key={loan.id}>
      <td>{loan.clientName}</td>
      <td>{loan.loanNumber}</td>
      <td>{formatCurrency(loan.principalAmount)}</td>
      <td>
        <StatusBadge status={loan.workflowStatus || 'pending_approval'} size="sm" />
      </td>
      <td>
        <StatusBadge status={loan.loanStatus || 'pending'} size="sm" />
      </td>
      <td>{/* Actions */}</td>
    </tr>
  ))}
</tbody>
```

### 5. **Loan Details Page**
**File**: `src/pages/Loans/LoanDetails.jsx`

Uses badges in the Payment Tracking section:

```jsx
{tracking.status && (
  <div className="info-item">
    <label>Status</label>
    <StatusBadge status={tracking.status} size="sm" />
  </div>
)}
```

---

## 🎨 Design Features

### Hover Effect
All badges have a subtle hover effect:
- **Translation**: `translateY(-1px)` - Slight upward movement
- **Shadow**: `0 2px 6px rgba(0, 0, 0, 0.12)` - Soft elevation shadow
- Creates a tactile, interactive feel

### Status Normalization
The component automatically normalizes status values:
- Converts to lowercase
- Replaces spaces and underscores with dashes
- Examples:
  - `"PENDING_APPROVAL"` → `"pending-approval"`
  - `"In Progress"` → `"in-progress"`
  - `"On Track"` → `"on-track"`

### Display Text Formatting
Automatically formats display text:
- Removes dashes and underscores
- Capitalizes via CSS (`text-transform: capitalize`)
- Examples:
  - `"pending_approval"` → `"Pending Approval"`
  - `"in-progress"` → `"In Progress"`

---

## 📱 Responsive Design

### Mobile Breakpoints (≤768px)

```css
@media (max-width: 768px) {
  .status-badge {
    font-size: 11px;
    padding: 5px 10px;
  }
  
  .status-badge.size-sm {
    padding: 4px 8px;
    font-size: 10px;
  }
  
  .status-badges {
    gap: 6px;
  }
}
```

---

## 🧪 Testing Checklist

### Visual Testing

- [ ] **Loan Details Page**
  - [ ] Payment Tracking status badge displays correctly
  - [ ] Badge colors match the defined palette
  - [ ] Hover effect works (slight elevation + shadow)

- [ ] **All Loans Table**
  - [ ] Workflow status column shows colored badges
  - [ ] Loan status column shows colored badges
  - [ ] Badges align properly in table cells
  - [ ] Multiple loans with different statuses render correctly

- [ ] **Loan Overview Card**
  - [ ] Header displays both workflow and loan status badges
  - [ ] Badges are aligned to the right
  - [ ] Badges wrap gracefully on smaller screens
  - [ ] Hover effects work on both badges

### Functional Testing

- [ ] **Status Normalization**
  - [ ] `"PENDING_APPROVAL"` renders as "Pending Approval" with amber color
  - [ ] `"pending_approval"` renders identically
  - [ ] `"Pending Approval"` (with spaces) renders identically

- [ ] **Edge Cases**
  - [ ] `null` or `undefined` status defaults to "pending"
  - [ ] Unknown status values fall back to pending style
  - [ ] Empty string handled gracefully

- [ ] **Size Variants**
  - [ ] `size="sm"` renders smaller badges
  - [ ] `size="md"` (default) renders medium badges
  - [ ] `size="lg"` renders larger badges

### Cross-Browser Testing

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)

### Responsive Testing

- [ ] Desktop (1920px)
- [ ] Laptop (1366px)
- [ ] Tablet (768px)
- [ ] Mobile (375px, 414px)

---

## 🔄 Migration Notes

### Replaced Old Status Display

**Before** (inline conditional styling):
```jsx
<span className={`status-badge ${
  tracking.status.toLowerCase() === 'completed' ? 'completed' :
  tracking.status.toLowerCase() === 'active' ? 'on-track' :
  'on-track'
}`}>
  {tracking.status}
</span>
```

**After** (StatusBadge component):
```jsx
<StatusBadge status={tracking.status} size="sm" />
```

### Benefits
1. **Consistency**: Same component used everywhere
2. **Maintainability**: Single source of truth for colors
3. **Flexibility**: Easy to add new statuses
4. **Accessibility**: Semantic HTML structure
5. **Performance**: CSS-based styling (no runtime style calculations)

---

## 🚀 Future Enhancements

### Potential Additions

1. **Icons**: Add small icons to badges (e.g., checkmark for completed)
2. **Tooltips**: Show additional info on hover (e.g., "Approved on Jan 15, 2025")
3. **Animation**: Entry/exit animations for badge changes
4. **Dark Mode**: Alternative color schemes for dark backgrounds
5. **Pulsing Effect**: Animate "pending" or "due" badges to draw attention

### Example Icon Integration

```jsx
<span className={`status-badge ${statusClass} ${sizeClass}`}>
  {statusIcon && <span className="badge-icon">{statusIcon}</span>}
  {displayText}
</span>
```

---

## 📚 Color Design Rationale

### Green Spectrum (Positive States)
- **Approved**, **Completed**, **On Track**, **Recorded**: Success, completion, positive outcomes

### Amber/Orange Spectrum (Warning States)
- **Pending Approval**, **Due**, **At Risk**: Attention needed, time-sensitive

### Red Spectrum (Negative States)
- **Rejected**, **Defaulted**, **Reversed**: Problems, failures, blocked states

### Blue Spectrum (Active States)
- **Disbursed**, **Active**, **Created**: Current, ongoing, in-process

### Gray Spectrum (Neutral States)
- **Open**, **Closed**, **Pending**: Neutral, stable, awaiting action

---

## 🛠️ Maintenance

### Adding New Status Colors

1. **Update CSS** (`StatusBadge.css`):
   ```css
   .status-badge.new-status {
     background: #COLOR1;
     color: #COLOR2;
     border-color: #COLOR3;
   }
   ```

2. **Update Documentation** (this file):
   - Add to color palette table
   - Add use case description

3. **Test** across all pages:
   - Loan Details
   - All Loans table
   - Loan Overview Card

### Color Consistency Guidelines

- Background should be very light (90-95% lightness)
- Text should be dark enough for WCAG AA contrast (4.5:1 minimum)
- Border should be medium tone between background and text
- All colors in the same family should use similar hue

---

## 📞 Support

If you encounter issues with the status badge system:

1. Check console for errors (component expects string values)
2. Verify CSS file is imported in the component
3. Confirm status value matches expected format
4. Test with different status values to isolate the issue

**Last Updated**: 2025-01-11  
**Version**: 1.0.0  
**Component**: StatusBadge  
**Author**: Warp AI Agent
