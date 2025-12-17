/**
 * Role-based permission helper
 * Determines what actions a user can perform based on their role
 */

export function canPerform(userRole, action) {
  const rolePermissions = {
    ADMIN: ['view', 'edit', 'delete', 'approve', 'reject', 'disburse', 'recordPayment', 'reversePayment', 'createLoan', 'editLoanProduct', 'deleteLoanProduct'],
    MANAGER: ['view', 'approve', 'reject', 'disburse', 'recordPayment'],
    LOAN_OFFICER: ['view', 'edit', 'delete', 'createLoan'],
    CASHIER: ['view', 'recordPayment', 'disburse'],
    VIEWER: ['view']
  };
  
  return rolePermissions[userRole]?.includes(action) || false;
}

/**
 * Check if user can modify a loan based on its status
 */
export function canModifyLoan(loanStatus, userRole) {
  // Can only edit/delete loans in PENDING_APPROVAL status
  if (loanStatus === 'PENDING_APPROVAL') {
    return canPerform(userRole, 'edit');
  }
  return false;
}

/**
 * Check if user can approve/reject a loan
 */
export function canApproveLoan(loanStatus, userRole) {
  if (loanStatus === 'PENDING_APPROVAL') {
    return canPerform(userRole, 'approve');
  }
  return false;
}

/**
 * Check if user can disburse a loan
 */
export function canDisburseLoan(loanStatus, userRole) {
  if (loanStatus === 'APPROVED') {
    return canPerform(userRole, 'disburse');
  }
  return false;
}

/**
 * Get allowed actions for a loan based on status and role
 */
export function getAllowedActions(loanStatus, userRole) {
  const actions = [];
  
  // View is always allowed
  actions.push('view');
  
  switch (loanStatus) {
    case 'PENDING_APPROVAL':
      if (canPerform(userRole, 'edit')) actions.push('edit');
      if (canPerform(userRole, 'delete')) actions.push('delete');
      if (canPerform(userRole, 'approve')) actions.push('approve');
      if (canPerform(userRole, 'reject')) actions.push('reject');
      break;
      
    case 'APPROVED':
      if (canPerform(userRole, 'disburse')) actions.push('disburse');
      break;
      
    case 'DISBURSED':
    case 'IN_PROGRESS':
    case 'OVERDUE':
    case 'CLOSED':
      // View only
      break;
      
    case 'REJECTED':
      if (canPerform(userRole, 'delete')) actions.push('delete');
      break;
      
    default:
      break;
  }
  
  return actions;
}
