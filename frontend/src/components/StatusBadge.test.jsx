import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatusBadge from './StatusBadge';

describe('StatusBadge Component', () => {
  describe('Loan Status (Operational)', () => {
    test('renders OPEN status correctly', () => {
      render(<StatusBadge status="OPEN" />);
      const badge = screen.getByText('OPEN');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('status-badge');
      expect(badge).toHaveClass('open');
    });

    test('renders IN_PROGRESS status correctly', () => {
      render(<StatusBadge status="IN_PROGRESS" />);
      const badge = screen.getByText('IN PROGRESS');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('in-progress');
    });

    test('renders CLOSED status correctly', () => {
      render(<StatusBadge status="CLOSED" />);
      const badge = screen.getByText('CLOSED');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('closed');
    });

    test('renders OVERDUE status correctly', () => {
      render(<StatusBadge status="OVERDUE" />);
      const badge = screen.getByText('OVERDUE');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('overdue');
    });

    test('renders DEFAULTED status correctly', () => {
      render(<StatusBadge status="DEFAULTED" />);
      const badge = screen.getByText('DEFAULTED');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('defaulted');
    });
  });

  describe('Workflow Status (Admin)', () => {
    test('renders PENDING_APPROVAL status correctly', () => {
      render(<StatusBadge status="PENDING_APPROVAL" />);
      const badge = screen.getByText('PENDING APPROVAL');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('pending-approval');
    });

    test('renders APPROVED status correctly', () => {
      render(<StatusBadge status="APPROVED" />);
      const badge = screen.getByText('APPROVED');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('approved');
    });

    test('renders REJECTED status correctly', () => {
      render(<StatusBadge status="REJECTED" />);
      const badge = screen.getByText('REJECTED');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('rejected');
    });

    test('renders DISBURSED status correctly', () => {
      render(<StatusBadge status="DISBURSED" />);
      const badge = screen.getByText('DISBURSED');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('disbursed');
    });
  });

  describe('Status Transitions', () => {
    test('updates when status changes from OPEN to IN_PROGRESS', () => {
      const { rerender } = render(<StatusBadge status="OPEN" />);
      expect(screen.getByText('OPEN')).toBeInTheDocument();

      rerender(<StatusBadge status="IN_PROGRESS" />);
      expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
      expect(screen.queryByText('OPEN')).not.toBeInTheDocument();
    });

    test('updates classes when status changes', () => {
      const { container, rerender } = render(<StatusBadge status="OPEN" />);
      let badge = container.querySelector('.status-badge');
      expect(badge).toHaveClass('open');

      rerender(<StatusBadge status="OVERDUE" />);
      badge = container.querySelector('.status-badge');
      expect(badge).toHaveClass('overdue');
      expect(badge).not.toHaveClass('open');
    });
  });
});

