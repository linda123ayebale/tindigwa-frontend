import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './AllLoans.css';
import AppLayout from '../../components/Layout/AppLayout';

export default function PastMaturity() {
  return (
    <AppLayout>
      <div className="dashboard-layout">
        <main className="dashboard-main">
        <div className="page-header"><div className="header-content"><h1>Past Maturity Date</h1></div></div>
        <div className="loans-table-container">
          <div className="empty-state"><p>Coming soon: loans past maturity date.</p></div>
        </div>
        </main>
      </div>
    </AppLayout>
  );
}
