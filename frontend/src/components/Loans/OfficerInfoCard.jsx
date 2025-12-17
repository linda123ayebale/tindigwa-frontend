import React from 'react';
import './OfficerInfoCard.css';

/**
 * OfficerInfoCard - Displays loan officer information
 */
const OfficerInfoCard = ({ officer }) => {
  if (!officer) {
    return (
      <div className="officer-info-card">
        <h3>Loan Officer</h3>
        <p>No officer information available</p>
      </div>
    );
  }

  return (
    <div className="officer-info-card">
      <h3>Loan Officer</h3>
      
      <div className="row">
        <span className="label">Full Name</span>
        <span className="value">{officer.fullName || 'N/A'}</span>
      </div>

      <div className="row">
        <span className="label">Phone</span>
        <span className="value">{officer.phone || 'N/A'}</span>
      </div>

      <div className="row">
        <span className="label">Email</span>
        <span className="value">{officer.email || 'N/A'}</span>
      </div>

      {officer.branch && (
        <div className="row">
          <span className="label">Branch</span>
          <span className="value">{officer.branch}</span>
        </div>
      )}

      {officer.role && (
        <div className="row">
          <span className="label">Role</span>
          <span className="value">{officer.role}</span>
        </div>
      )}
    </div>
  );
};

export default OfficerInfoCard;
