import React from 'react';
import './ClientInfoCard.css';

/**
 * ClientInfoCard - Displays client contact and personal information
 */
const ClientInfoCard = ({ client }) => {
  if (!client) {
    return (
      <div className="client-info-card">
        <h3>Client Information</h3>
        <p>No client information available</p>
      </div>
    );
  }

  return (
    <div className="client-info-card">
      <h3>Client Information</h3>
      
      <div className="row">
        <span className="label">Full Name</span>
        <span className="value">{client.fullName || 'N/A'}</span>
      </div>

      <div className="row">
        <span className="label">Phone</span>
        <span className="value">{client.phone || 'N/A'}</span>
      </div>

      <div className="row">
        <span className="label">Email</span>
        <span className="value">{client.email || 'N/A'}</span>
      </div>

      <div className="row">
        <span className="label">Address</span>
        <span className="value">{client.address || 'N/A'}</span>
      </div>

      {client.district && (
        <div className="row">
          <span className="label">District</span>
          <span className="value">{client.district}</span>
        </div>
      )}

      {client.nationalId && (
        <div className="row">
          <span className="label">National ID</span>
          <span className="value">{client.nationalId}</span>
        </div>
      )}

      {client.occupation && (
        <div className="row">
          <span className="label">Occupation</span>
          <span className="value">{client.occupation}</span>
        </div>
      )}
    </div>
  );
};

export default ClientInfoCard;
