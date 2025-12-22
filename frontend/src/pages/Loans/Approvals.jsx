import React from 'react';
import './AllLoans.css';
import AppLayout from '../../components/Layout/AppLayout';

export default function Approvals() {
  return (
    <AppLayout>
      <div className="dashboard-layout">
        <main className="dashboard-main">
        <div className="page-header"><div className="header-content"><h1>Approve Loans</h1></div></div>
        <div className="loans-table-container">
          <div className="empty-state"><p>Coming soon: multi-stage approvals queue.</p></div>
        </div>
        </main>
      </div>
    </AppLayout>
  );
}
