/**
 * Status Helpers - Harmonization Logic for workflowStatus and loanStatus
 * 
 * This utility provides functions to:
 * 1. Compute a displayStatus/loanStage that combines both status fields
 * 2. Validate status synchronization between workflowStatus and loanStatus
 * 3. Determine which action buttons should be visible based on both statuses
 */

// ============================================================================
// HARMONIZATION RULES
// ============================================================================

/**
 * Get the expected loanStatus for a given workflowStatus
 * Based on harmonization rules:
 * - PENDING_APPROVAL → OPEN
 * - APPROVED → OPEN
 * - DISBURSED → ACTIVE
 * - REJECTED → CLOSED
 */
export function getExpectedLoanStatus(workflowStatus) {
  const harmonizationMap = {
    'PENDING_APPROVAL': 'OPEN',
    'APPROVED': 'OPEN',
    'DISBURSED': 'ACTIVE',
    'REJECTED': 'CLOSED'
  };
  
  return harmonizationMap[workflowStatus] || 'OPEN';
}

/**
 * Check if workflowStatus and loanStatus are properly synchronized
 */
export function areStatusesSynchronized(workflowStatus, loanStatus) {
  // For operational statuses, DISBURSED workflow can have multiple loan statuses
  if (workflowStatus === 'DISBURSED') {
    const validLoanStatuses = ['OPEN', 'IN_PROGRESS', 'OVERDUE', 'CLOSED', 'DEFAULTED'];
    return validLoanStatuses.includes(loanStatus);
  }
  
  const expectedLoanStatus = getExpectedLoanStatus(workflowStatus);
  return loanStatus === expectedLoanStatus;
}

// ============================================================================
// DISPLAY STATUS / LOAN STAGE
// ============================================================================

/**
 * Compute a readable display status that combines both workflowStatus and loanStatus
 * Returns an object with display label, color, and icon
 */
export function getDisplayStatus(workflowStatus, loanStatus) {
  // Normalize inputs
  const workflow = workflowStatus?.toUpperCase() || '';
  const operational = loanStatus?.toUpperCase() || '';
  
  // Priority 1: Administrative workflow takes precedence for non-disbursed loans
  if (workflow === 'PENDING_APPROVAL') {
    return {
      label: 'Awaiting Approval',
      stage: 'awaiting-approval',
      color: 'amber',
      icon: 'clock',
      description: 'Loan application pending review by cashier/manager'
    };
  }
  
  if (workflow === 'REJECTED') {
    return {
      label: 'Rejected',
      stage: 'rejected',
      color: 'red',
      icon: 'x-circle',
      description: 'Loan application was rejected'
    };
  }
  
  if (workflow === 'APPROVED') {
    return {
      label: 'Awaiting Disbursement',
      stage: 'awaiting-disbursement',
      color: 'blue',
      icon: 'send',
      description: 'Loan approved and ready for disbursement'
    };
  }
  
  // Priority 2: For DISBURSED loans, use operational status
  if (workflow === 'DISBURSED') {
    switch (operational) {
      case 'OPEN':
        return {
          label: 'Open Loan',
          stage: 'open',
          color: 'gray',
          icon: 'circle',
          description: 'No installment made yet'
        };
      
      case 'IN_PROGRESS':
        return {
          label: 'In Progress',
          stage: 'in-progress',
          color: 'blue',
          icon: 'trending-up',
          description: 'At least one installment made'
        };
      
      case 'CLOSED':
        return {
          label: 'Closed (Paid Early)',
          stage: 'closed',
          color: 'green',
          icon: 'check-circle',
          description: 'Fully paid before maturity date'
        };
      
      case 'OVERDUE':
        return {
          label: 'Overdue',
          stage: 'overdue',
          color: 'orange',
          icon: 'alert-circle',
          description: 'Payment made after maturity date'
        };
      
      case 'DEFAULTED':
        return {
          label: 'Defaulted',
          stage: 'defaulted',
          color: 'red',
          icon: 'alert-triangle',
          description: 'No payment for 180+ days after maturity'
        };
      
      default:
        return {
          label: 'Disbursed',
          stage: 'disbursed',
          color: 'blue',
          icon: 'dollar-sign',
          description: 'Loan has been disbursed'
        };
    }
  }
  
  // Fallback
  return {
    label: 'Open',
    stage: 'open',
    color: 'gray',
    icon: 'file',
    description: 'Loan is open'
  };
}

/**
 * Get a simplified stage name for the loan (useful for filtering)
 */
export function getLoanStage(workflowStatus, loanStatus) {
  return getDisplayStatus(workflowStatus, loanStatus).stage;
}

// ============================================================================
// ACTION BUTTON VISIBILITY LOGIC
// ============================================================================

/**
 * Determine which admin actions should be available based on workflowStatus
 * Admin actions: Edit, Approve, Reject, Disburse, Delete
 */
export function getAvailableAdminActions(workflowStatus) {
  const workflow = workflowStatus?.toUpperCase() || '';
  const actions = {
    canEdit: false,
    canApprove: false,
    canReject: false,
    canDisburse: false,
    canDelete: false
  };
  
  switch (workflow) {
    case 'PENDING_APPROVAL':
      actions.canEdit = true;
      actions.canApprove = true;
      actions.canReject = true;
      actions.canDelete = true;
      break;
    
    case 'APPROVED':
      actions.canDisburse = true;
      break;
    
    case 'REJECTED':
      // Rejected loans can only be deleted (by admin)
      actions.canDelete = true;
      break;
    
    case 'DISBURSED':
      // Disbursed loans cannot be edited or deleted
      break;
  }
  
  return actions;
}

/**
 * Determine which operational actions should be available based on loanStatus
 * Operational actions: Record Payment, Send Reminder, View Tracking, Export Report
 */
export function getAvailableOperationalActions(workflowStatus, loanStatus) {
  const workflow = workflowStatus?.toUpperCase() || '';
  const operational = loanStatus?.toUpperCase() || '';
  
  const actions = {
    canRecordPayment: false,
    canSendReminder: false,
    canViewTracking: false,
    canExportReport: false
  };
  
  // Only disbursed loans can have operational actions
  if (workflow !== 'DISBURSED') {
    return actions;
  }
  
  switch (operational) {
    case 'OPEN':
      // No payments yet - can only view tracking
      actions.canViewTracking = true;
      break;
    
    case 'IN_PROGRESS':
      actions.canRecordPayment = true;
      actions.canViewTracking = true;
      break;
    
    case 'OVERDUE':
      actions.canRecordPayment = true;
      actions.canSendReminder = true;
      actions.canViewTracking = true;
      break;
    
    case 'CLOSED':
      // Fully paid - can only view and export
      actions.canViewTracking = true;
      actions.canExportReport = true;
      break;
    
    case 'DEFAULTED':
      actions.canViewTracking = true;
      actions.canExportReport = true;
      actions.canSendReminder = true;
      break;
  }
  
  return actions;
}

/**
 * Get all available actions for a loan (combines admin + operational)
 */
export function getAllAvailableActions(workflowStatus, loanStatus) {
  const adminActions = getAvailableAdminActions(workflowStatus);
  const operationalActions = getAvailableOperationalActions(workflowStatus, loanStatus);
  
  return {
    ...adminActions,
    ...operationalActions,
    // View Details is always available
    canView: true
  };
}

// ============================================================================
// STATUS VALIDATION & DEBUGGING
// ============================================================================

/**
 * Validate loan status fields and return any issues found
 * Useful for debugging and data quality checks
 */
export function validateLoanStatuses(loan) {
  const issues = [];
  
  if (!loan.workflowStatus) {
    issues.push('Missing workflowStatus field');
  }
  
  if (!loan.loanStatus) {
    issues.push('Missing loanStatus field');
  }
  
  if (loan.workflowStatus && loan.loanStatus) {
    if (!areStatusesSynchronized(loan.workflowStatus, loan.loanStatus)) {
      issues.push(`Status mismatch: workflowStatus=${loan.workflowStatus}, loanStatus=${loan.loanStatus}`);
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

/**
 * Format status for display (converts from backend format to readable format)
 */
export function formatStatusForDisplay(status) {
  if (!status) return 'Unknown';
  
  // Convert from SCREAMING_SNAKE_CASE to Title Case
  return status
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

// ============================================================================
// SIMPLE STATUS HELPERS (for StatusBadge component)
// ============================================================================

/**
 * Get CSS class for loan status (operational)
 */
export function getStatusColor(status) {
  if (!status) return 'status-default';
  const normalized = status.toString().trim().toUpperCase();
  
  const colorMap = {
    'OPEN': 'status-open',
    'IN_PROGRESS': 'status-in-progress',
    'CLOSED': 'status-closed',
    'OVERDUE': 'status-overdue',
    'DEFAULTED': 'status-defaulted'
  };
  
  return colorMap[normalized] || 'status-default';
}

/**
 * Get label for loan status (operational)
 */
export function getStatusLabel(status) {
  if (!status) return 'Unknown';
  const normalized = status.toString().trim().toUpperCase();
  
  const labelMap = {
    'OPEN': 'Open',
    'IN_PROGRESS': 'In Progress',
    'CLOSED': 'Closed',
    'OVERDUE': 'Overdue',
    'DEFAULTED': 'Defaulted'
  };
  
  return labelMap[normalized] || formatStatusForDisplay(status);
}

/**
 * Get CSS class for workflow status (admin)
 */
export function getWorkflowStatusColor(status) {
  if (!status) return 'status-default';
  const normalized = status.toString().trim().toUpperCase();
  
  const colorMap = {
    'PENDING_APPROVAL': 'status-pending',
    'APPROVED': 'status-approved',
    'REJECTED': 'status-rejected',
    'DISBURSED': 'status-disbursed'
  };
  
  return colorMap[normalized] || 'status-default';
}

/**
 * Get label for workflow status (admin)
 */
export function getWorkflowStatusLabel(status) {
  if (!status) return 'Unknown';
  const normalized = status.toString().trim().toUpperCase();
  
  const labelMap = {
    'PENDING_APPROVAL': 'Pending Approval',
    'APPROVED': 'Approved',
    'REJECTED': 'Rejected',
    'DISBURSED': 'Disbursed'
  };
  
  return labelMap[normalized] || formatStatusForDisplay(status);
}

// ============================================================================
// BUTTON VISIBILITY HELPERS (simplified)
// ============================================================================

/**
 * Should show Approve button
 */
export function shouldShowApproveButton(loan) {
  if (!loan || !loan.workflowStatus) return false;
  return loan.workflowStatus.toUpperCase() === 'PENDING_APPROVAL';
}

/**
 * Should show Reject button
 */
export function shouldShowRejectButton(loan) {
  if (!loan || !loan.workflowStatus) return false;
  return loan.workflowStatus.toUpperCase() === 'PENDING_APPROVAL';
}

/**
 * Should show Disburse button
 */
export function shouldShowDisburseButton(loan) {
  if (!loan || !loan.workflowStatus) return false;
  return loan.workflowStatus.toUpperCase() === 'APPROVED';
}

/**
 * Should show Edit button
 */
export function shouldShowEditButton(loan) {
  if (!loan || !loan.workflowStatus) return false;
  return loan.workflowStatus.toUpperCase() === 'PENDING_APPROVAL';
}

/**
 * Should show Delete button
 */
export function shouldShowDeleteButton(loan) {
  if (!loan || !loan.workflowStatus) return false;
  return loan.workflowStatus.toUpperCase() === 'PENDING_APPROVAL';
}

/**
 * Check if user can perform an action on a loan
 */
export function canPerformAction(loan, action) {
  if (!loan || !action) return false;
  
  const actionMap = {
    'APPROVE': shouldShowApproveButton(loan),
    'REJECT': shouldShowRejectButton(loan),
    'DISBURSE': shouldShowDisburseButton(loan),
    'EDIT': shouldShowEditButton(loan),
    'DELETE': shouldShowDeleteButton(loan)
  };
  
  return actionMap[action.toUpperCase()] || false;
}

// ============================================================================
// EXPORT ALL FUNCTIONS
// ============================================================================

export default {
  getExpectedLoanStatus,
  areStatusesSynchronized,
  getDisplayStatus,
  getLoanStage,
  getAvailableAdminActions,
  getAvailableOperationalActions,
  getAllAvailableActions,
  validateLoanStatuses,
  formatStatusForDisplay,
  getStatusColor,
  getStatusLabel,
  getWorkflowStatusColor,
  getWorkflowStatusLabel,
  shouldShowApproveButton,
  shouldShowRejectButton,
  shouldShowDisburseButton,
  shouldShowEditButton,
  shouldShowDeleteButton,
  canPerformAction
};
