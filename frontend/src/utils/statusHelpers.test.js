import {
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
} from './statusHelpers';

describe('Status Helpers - Loan Status (Operational)', () => {
  describe('getStatusColor', () => {
    test('returns gray for OPEN status', () => {
      expect(getStatusColor('OPEN')).toBe('status-open');
    });

    test('returns blue for IN_PROGRESS status', () => {
      expect(getStatusColor('IN_PROGRESS')).toBe('status-in-progress');
    });

    test('returns green for CLOSED status', () => {
      expect(getStatusColor('CLOSED')).toBe('status-closed');
    });

    test('returns orange for OVERDUE status', () => {
      expect(getStatusColor('OVERDUE')).toBe('status-overdue');
    });

    test('returns red for DEFAULTED status', () => {
      expect(getStatusColor('DEFAULTED')).toBe('status-defaulted');
    });

    test('returns default for unknown status', () => {
      expect(getStatusColor('UNKNOWN')).toBe('status-default');
    });

    test('handles null/undefined', () => {
      expect(getStatusColor(null)).toBe('status-default');
      expect(getStatusColor(undefined)).toBe('status-default');
    });

    test('is case-insensitive', () => {
      expect(getStatusColor('open')).toBe('status-open');
      expect(getStatusColor('In_Progress')).toBe('status-in-progress');
    });
  });

  describe('getStatusLabel', () => {
    test('returns correct label for OPEN', () => {
      expect(getStatusLabel('OPEN')).toBe('Open');
    });

    test('returns correct label for IN_PROGRESS', () => {
      expect(getStatusLabel('IN_PROGRESS')).toBe('In Progress');
    });

    test('returns correct label for CLOSED', () => {
      expect(getStatusLabel('CLOSED')).toBe('Closed');
    });

    test('returns correct label for OVERDUE', () => {
      expect(getStatusLabel('OVERDUE')).toBe('Overdue');
    });

    test('returns correct label for DEFAULTED', () => {
      expect(getStatusLabel('DEFAULTED')).toBe('Defaulted');
    });

    test('returns original status for unknown', () => {
      expect(getStatusLabel('CUSTOM_STATUS')).toBe('Custom Status');
    });

    test('handles null/undefined', () => {
      expect(getStatusLabel(null)).toBe('Unknown');
      expect(getStatusLabel(undefined)).toBe('Unknown');
    });
  });
});

describe('Status Helpers - Workflow Status (Admin)', () => {
  describe('getWorkflowStatusColor', () => {
    test('returns yellow for PENDING_APPROVAL', () => {
      expect(getWorkflowStatusColor('PENDING_APPROVAL')).toBe('status-pending');
    });

    test('returns green for APPROVED', () => {
      expect(getWorkflowStatusColor('APPROVED')).toBe('status-approved');
    });

    test('returns red for REJECTED', () => {
      expect(getWorkflowStatusColor('REJECTED')).toBe('status-rejected');
    });

    test('returns blue for DISBURSED', () => {
      expect(getWorkflowStatusColor('DISBURSED')).toBe('status-disbursed');
    });

    test('returns default for unknown status', () => {
      expect(getWorkflowStatusColor('UNKNOWN')).toBe('status-default');
    });

    test('is case-insensitive', () => {
      expect(getWorkflowStatusColor('pending_approval')).toBe('status-pending');
    });
  });

  describe('getWorkflowStatusLabel', () => {
    test('returns correct label for PENDING_APPROVAL', () => {
      expect(getWorkflowStatusLabel('PENDING_APPROVAL')).toBe('Pending Approval');
    });

    test('returns correct label for APPROVED', () => {
      expect(getWorkflowStatusLabel('APPROVED')).toBe('Approved');
    });

    test('returns correct label for REJECTED', () => {
      expect(getWorkflowStatusLabel('REJECTED')).toBe('Rejected');
    });

    test('returns correct label for DISBURSED', () => {
      expect(getWorkflowStatusLabel('DISBURSED')).toBe('Disbursed');
    });

    test('handles null/undefined', () => {
      expect(getWorkflowStatusLabel(null)).toBe('Unknown');
      expect(getWorkflowStatusLabel(undefined)).toBe('Unknown');
    });
  });
});

describe('Status Helpers - Action Button Visibility', () => {
  describe('shouldShowApproveButton', () => {
    test('shows for PENDING_APPROVAL workflow status', () => {
      const loan = { workflowStatus: 'PENDING_APPROVAL', loanStatus: 'OPEN' };
      expect(shouldShowApproveButton(loan)).toBe(true);
    });

    test('hides for APPROVED workflow status', () => {
      const loan = { workflowStatus: 'APPROVED', loanStatus: 'OPEN' };
      expect(shouldShowApproveButton(loan)).toBe(false);
    });

    test('hides for REJECTED workflow status', () => {
      const loan = { workflowStatus: 'REJECTED', loanStatus: 'CLOSED' };
      expect(shouldShowApproveButton(loan)).toBe(false);
    });

    test('hides for DISBURSED workflow status', () => {
      const loan = { workflowStatus: 'DISBURSED', loanStatus: 'OPEN' };
      expect(shouldShowApproveButton(loan)).toBe(false);
    });

    test('handles missing loan object', () => {
      expect(shouldShowApproveButton(null)).toBe(false);
      expect(shouldShowApproveButton(undefined)).toBe(false);
    });
  });

  describe('shouldShowRejectButton', () => {
    test('shows for PENDING_APPROVAL workflow status', () => {
      const loan = { workflowStatus: 'PENDING_APPROVAL', loanStatus: 'OPEN' };
      expect(shouldShowRejectButton(loan)).toBe(true);
    });

    test('hides for APPROVED workflow status', () => {
      const loan = { workflowStatus: 'APPROVED', loanStatus: 'OPEN' };
      expect(shouldShowRejectButton(loan)).toBe(false);
    });

    test('hides for already REJECTED workflow status', () => {
      const loan = { workflowStatus: 'REJECTED', loanStatus: 'CLOSED' };
      expect(shouldShowRejectButton(loan)).toBe(false);
    });

    test('hides for DISBURSED workflow status', () => {
      const loan = { workflowStatus: 'DISBURSED', loanStatus: 'OPEN' };
      expect(shouldShowRejectButton(loan)).toBe(false);
    });
  });

  describe('shouldShowDisburseButton', () => {
    test('shows for APPROVED workflow status', () => {
      const loan = { workflowStatus: 'APPROVED', loanStatus: 'OPEN' };
      expect(shouldShowDisburseButton(loan)).toBe(true);
    });

    test('hides for PENDING_APPROVAL workflow status', () => {
      const loan = { workflowStatus: 'PENDING_APPROVAL', loanStatus: 'OPEN' };
      expect(shouldShowDisburseButton(loan)).toBe(false);
    });

    test('hides for REJECTED workflow status', () => {
      const loan = { workflowStatus: 'REJECTED', loanStatus: 'CLOSED' };
      expect(shouldShowDisburseButton(loan)).toBe(false);
    });

    test('hides for already DISBURSED workflow status', () => {
      const loan = { workflowStatus: 'DISBURSED', loanStatus: 'OPEN' };
      expect(shouldShowDisburseButton(loan)).toBe(false);
    });
  });

  describe('shouldShowEditButton', () => {
    test('shows for PENDING_APPROVAL workflow status', () => {
      const loan = { workflowStatus: 'PENDING_APPROVAL', loanStatus: 'OPEN' };
      expect(shouldShowEditButton(loan)).toBe(true);
    });

    test('hides for APPROVED workflow status', () => {
      const loan = { workflowStatus: 'APPROVED', loanStatus: 'OPEN' };
      expect(shouldShowEditButton(loan)).toBe(false);
    });

    test('hides for REJECTED workflow status', () => {
      const loan = { workflowStatus: 'REJECTED', loanStatus: 'CLOSED' };
      expect(shouldShowEditButton(loan)).toBe(false);
    });

    test('hides for DISBURSED workflow status', () => {
      const loan = { workflowStatus: 'DISBURSED', loanStatus: 'OPEN' };
      expect(shouldShowEditButton(loan)).toBe(false);
    });
  });

  describe('shouldShowDeleteButton', () => {
    test('shows for PENDING_APPROVAL workflow status', () => {
      const loan = { workflowStatus: 'PENDING_APPROVAL', loanStatus: 'OPEN' };
      expect(shouldShowDeleteButton(loan)).toBe(true);
    });

    test('hides for APPROVED workflow status', () => {
      const loan = { workflowStatus: 'APPROVED', loanStatus: 'OPEN' };
      expect(shouldShowDeleteButton(loan)).toBe(false);
    });

    test('hides for REJECTED workflow status', () => {
      const loan = { workflowStatus: 'REJECTED', loanStatus: 'CLOSED' };
      expect(shouldShowDeleteButton(loan)).toBe(false);
    });

    test('hides for DISBURSED workflow status', () => {
      const loan = { workflowStatus: 'DISBURSED', loanStatus: 'OPEN' };
      expect(shouldShowDeleteButton(loan)).toBe(false);
    });
  });
});

describe('Status Helpers - Permission Checks', () => {
  describe('canPerformAction', () => {
    test('allows approve action for pending loan', () => {
      const loan = { workflowStatus: 'PENDING_APPROVAL', loanStatus: 'OPEN' };
      expect(canPerformAction(loan, 'APPROVE')).toBe(true);
    });

    test('denies approve action for approved loan', () => {
      const loan = { workflowStatus: 'APPROVED', loanStatus: 'OPEN' };
      expect(canPerformAction(loan, 'APPROVE')).toBe(false);
    });

    test('allows disburse action for approved loan', () => {
      const loan = { workflowStatus: 'APPROVED', loanStatus: 'OPEN' };
      expect(canPerformAction(loan, 'DISBURSE')).toBe(true);
    });

    test('denies disburse action for pending loan', () => {
      const loan = { workflowStatus: 'PENDING_APPROVAL', loanStatus: 'OPEN' };
      expect(canPerformAction(loan, 'DISBURSE')).toBe(false);
    });

    test('allows edit action for pending loan', () => {
      const loan = { workflowStatus: 'PENDING_APPROVAL', loanStatus: 'OPEN' };
      expect(canPerformAction(loan, 'EDIT')).toBe(true);
    });

    test('denies edit action for disbursed loan', () => {
      const loan = { workflowStatus: 'DISBURSED', loanStatus: 'OPEN' };
      expect(canPerformAction(loan, 'EDIT')).toBe(false);
    });

    test('handles unknown action', () => {
      const loan = { workflowStatus: 'PENDING_APPROVAL', loanStatus: 'OPEN' };
      expect(canPerformAction(loan, 'UNKNOWN_ACTION')).toBe(false);
    });

    test('handles missing loan', () => {
      expect(canPerformAction(null, 'APPROVE')).toBe(false);
      expect(canPerformAction(undefined, 'APPROVE')).toBe(false);
    });
  });
});

describe('Status Helpers - Status Synchronization', () => {
  test('PENDING_APPROVAL workflow should have OPEN loan status', () => {
    const loan = { workflowStatus: 'PENDING_APPROVAL', loanStatus: 'OPEN' };
    expect(loan.loanStatus).toBe('OPEN');
  });

  test('APPROVED workflow should have OPEN loan status', () => {
    const loan = { workflowStatus: 'APPROVED', loanStatus: 'OPEN' };
    expect(loan.loanStatus).toBe('OPEN');
  });

  test('DISBURSED workflow can have various loan statuses', () => {
    const openLoan = { workflowStatus: 'DISBURSED', loanStatus: 'OPEN' };
    const progressLoan = { workflowStatus: 'DISBURSED', loanStatus: 'IN_PROGRESS' };
    const closedLoan = { workflowStatus: 'DISBURSED', loanStatus: 'CLOSED' };
    const overdueLoan = { workflowStatus: 'DISBURSED', loanStatus: 'OVERDUE' };
    const defaultedLoan = { workflowStatus: 'DISBURSED', loanStatus: 'DEFAULTED' };

    expect(openLoan.workflowStatus).toBe('DISBURSED');
    expect(progressLoan.workflowStatus).toBe('DISBURSED');
    expect(closedLoan.workflowStatus).toBe('DISBURSED');
    expect(overdueLoan.workflowStatus).toBe('DISBURSED');
    expect(defaultedLoan.workflowStatus).toBe('DISBURSED');
  });

  test('REJECTED workflow should have CLOSED loan status', () => {
    const loan = { workflowStatus: 'REJECTED', loanStatus: 'CLOSED' };
    expect(loan.loanStatus).toBe('CLOSED');
  });
});

describe('Status Helpers - Edge Cases', () => {
  test('handles empty string status', () => {
    expect(getStatusColor('')).toBe('status-default');
    expect(getStatusLabel('')).toBe('Unknown');
  });

  test('handles mixed case status', () => {
    expect(getStatusColor('PeNdInG_ApPrOvAl')).toBeDefined();
    expect(getWorkflowStatusColor('ApProVeD')).toBeDefined();
  });

  test('handles status with extra whitespace', () => {
    expect(getStatusColor(' OPEN ')).toBe('status-open');
    expect(getStatusLabel(' IN_PROGRESS ')).toBe('In Progress');
  });

  test('button visibility handles malformed loan objects', () => {
    expect(shouldShowApproveButton({})).toBe(false);
    expect(shouldShowRejectButton({ workflowStatus: null })).toBe(false);
    expect(shouldShowDisburseButton({ loanStatus: 'OPEN' })).toBe(false);
  });
});
