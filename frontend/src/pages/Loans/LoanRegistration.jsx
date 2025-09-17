import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import './LoanRegistration.css';

const LoanRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    clientId: '',
    lendingBranch: '',
    amountDisbursed: '',
    loanDuration: '',
    repaymentFrequency: '',
    interestRate: '',
    startDate: '',
    loanOfficerName: '',
    agreementSigned: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add validation logic here
    console.log('Loan Registration Data:', formData);
    
    // For now, just simulate saving and redirect to disbursed loans
    alert('Loan registered successfully!');
    navigate('/loans/disbursed');
  };

  const branches = [
    'Main Branch - Kampala',
    'Entebbe Branch',
    'Jinja Branch',
    'Mbarara Branch',
    'Gulu Branch'
  ];

  const frequencies = [
    'Daily',
    'Weekly',
    'Bi-weekly',
    'Monthly',
    'Quarterly'
  ];

  return (
    <div className="loan-registration-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>TINDIGWA</h2>
        </div>
        
        <nav className="sidebar-nav">
          <button className="nav-item" onClick={() => navigate('/dashboard')}>
            <span>Dashboard</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/clients')}>
            <span>Clients</span>
          </button>
          <button className="nav-item active">
            <span>Loans</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/payments')}>
            <span>Payments</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/settings')}>
            <span>Settings</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="page-header">
          <h1>Loan Registration</h1>
        </div>

        <div className="content-container">
          <form onSubmit={handleSubmit}>
            {/* Loan Information Section */}
            <div className="info-section">
              <h2>Loan Information</h2>
              
              <div className="info-grid">
                <div className="info-row">
                  <span className="info-label">Client ID</span>
                  <input
                    type="text"
                    name="clientId"
                    value={formData.clientId}
                    onChange={handleInputChange}
                    placeholder="Enter Client ID"
                    className="info-input"
                    required
                  />
                </div>
                
                <div className="info-row">
                  <span className="info-label">Lending Branch</span>
                  <select
                    name="lendingBranch"
                    value={formData.lendingBranch}
                    onChange={handleInputChange}
                    className="info-input"
                    required
                  >
                    <option value="">Select Branch</option>
                    {branches.map((branch, index) => (
                      <option key={index} value={branch}>{branch}</option>
                    ))}
                  </select>
                </div>
                
                <div className="info-row">
                  <span className="info-label">Amount Disbursed</span>
                  <input
                    type="number"
                    name="amountDisbursed"
                    value={formData.amountDisbursed}
                    onChange={handleInputChange}
                    placeholder="Enter Amount"
                    className="info-input"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div className="info-row">
                  <span className="info-label">Loan Duration (Days)</span>
                  <input
                    type="number"
                    name="loanDuration"
                    value={formData.loanDuration}
                    onChange={handleInputChange}
                    placeholder="Enter loan duration in days"
                    className="info-input"
                    min="1"
                    required
                  />
                </div>
                
                <div className="info-row">
                  <span className="info-label">Repayment Frequency</span>
                  <select
                    name="repaymentFrequency"
                    value={formData.repaymentFrequency}
                    onChange={handleInputChange}
                    className="info-input"
                    required
                  >
                    <option value="">Select Frequency</option>
                    {frequencies.map((frequency, index) => (
                      <option key={index} value={frequency}>{frequency}</option>
                    ))}
                  </select>
                </div>
                
                <div className="info-row">
                  <span className="info-label">Interest Rate (%)</span>
                  <input
                    type="number"
                    name="interestRate"
                    value={formData.interestRate}
                    onChange={handleInputChange}
                    placeholder="Enter interest rate percentage"
                    className="info-input"
                    min="0"
                    max="100"
                    step="0.01"
                    required
                  />
                </div>
                
                <div className="info-row">
                  <span className="info-label">Start Date</span>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="info-input"
                    required
                  />
                </div>
                
                <div className="info-row">
                  <span className="info-label">Loan Officer Name</span>
                  <input
                    type="text"
                    name="loanOfficerName"
                    value={formData.loanOfficerName}
                    onChange={handleInputChange}
                    placeholder="Enter Officer Name"
                    className="info-input"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Agreement Status Section */}
            <div className="status-section">
              <h2>Agreement Status</h2>
              
              <div className="status-grid">
                <div className="status-row">
                  <span className="status-label">Loan Agreement Signed</span>
                  <span className="status-value">
                    {formData.agreementSigned ? 'Yes' : 'No'}
                  </span>
                </div>
                
                <div className="checkbox-container">
                  <label className="agreement-checkbox">
                    <input
                      type="checkbox"
                      name="agreementSigned"
                      checked={formData.agreementSigned}
                      onChange={handleInputChange}
                      required
                    />
                    <span className="custom-checkbox"></span>
                    Loan Agreement Signed
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="form-submit">
              <button type="submit" className="submit-button">
                Register Loan
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default LoanRegistration;
