import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import loanService from '../../services/loanService';
import AppLayout from '../../components/Layout/AppLayout';
import './AllLoans.css';

export default function DueLoans() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Placeholder: fetch all and filter client-side until backend filter exists
    (async () => {
      try {
        const data = await loanService.getAllLoans();
        const items = Array.isArray(data) ? data : (data?.items || []);
        setLoans(items);
      } catch (e) {
        // fallback to empty/sample
        setLoans([]);
      }
    })();
  }, []);

  const filtered = loans.filter(l =>
    !searchTerm || `${l.clientName||''} ${l.id||''}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="dashboard-layout">
        <main className="dashboard-main">
        <div className="page-header">
          <div className="header-content"><h1>Due Loans</h1></div>
        </div>
        <div className="loans-controls">
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input type="text" placeholder="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="filter-controls">
            <Filter size={16} />
          </div>
        </div>

        <div className="loans-table-container">
          {filtered.length === 0 ? (
            <div className="empty-state"><p>No due loans to show.</p></div>
          ) : (
            <div className="loans-table">
              <div className="table-header">
                <div className="table-row header-row">
                  <div className="table-cell">Client</div>
                  <div className="table-cell">Loan #</div>
                  <div className="table-cell">Amount Due</div>
                  <div className="table-cell">Due Date</div>
                  <div className="table-cell">Actions</div>
                </div>
              </div>
              <div className="table-body">
                {filtered.map(l => (
                  <div className="table-row" key={l.id}>
                    <div className="table-cell">{l.clientName}</div>
                    <div className="table-cell">{l.id}</div>
                    <div className="table-cell">-</div>
                    <div className="table-cell">-</div>
                    <div className="table-cell">
                      <button className="action-btn view" onClick={() => navigate(`/loans/details/${l.id}`)}>View</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        </main>
      </div>
    </AppLayout>
  );
}
