import React from 'react';
import './StatusBadge.css';

/**
 * Unified Status Badge Component
 * Color-coded status badges with consistent styling across all loan tables
 * 
 * Supported statuses:
 * - approved: Green (#E7F9EE)
 * - pending_approval: Amber (#FFF6E5)
 * - rejected: Red (#FFE8E8)
 * - disbursed: Blue (#E6F3FF)
 * - completed: Mint Green (#E9F8F2)
 * - due: Peach (#FFF4E5)
 * - defaulted: Rose (#FDE8E8)
 * - open: Gray (#F0F0F0)
 * - active: Light Blue (#E8F4FD)
 * - overdue: Orange (#FFF0E5)
 * - closed: Dark Gray (#E8E8E8)
 * - pending: Neutral Gray (#F5F5F5)
 */

const StatusBadge = ({ status = 'pending', size = 'md' }) => {
  // Normalize status: lowercase and convert spaces/underscores to dashes
  const normalized = status
    ?.toString()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .trim() || 'pending';

  // Generate class names
  const sizeClass = `size-${size}`;
  const statusClass = normalized;

  // Format display text (replace dashes/underscores with spaces, capitalize)
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

export default StatusBadge;
