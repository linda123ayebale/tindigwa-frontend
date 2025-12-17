import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './AllLoans.css';
import AppLayout from '../../components/Layout/AppLayout';

export default function NoRepayments() {
  return (
    <AppLayout>
      <div className="dashboard-layout">
        <main className="dashboard-main">
        <div className="page-header"><div className="header-content"><h1>No Repayments</h1></div></div>
        <div className="loans-table-container">
          <div className="empty-state"><p>Coming soon: loans with zero payments.</p></div>
        </div>
        </main>
      </div>
    </AppLayout>
  );
}
