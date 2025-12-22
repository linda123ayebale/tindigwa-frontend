import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search,
  TrendingUp,
  TrendingDown,
  Download,
  PieChart,
  Eye,
  Plus,
  ChevronDown
} from 'lucide-react';
import Sidebar from '../../components/Layout/Sidebar';
import './FinancialDashboard.css';

const FinancialDashboard = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('this-year');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample financial data
  const [financialData] = useState({
    totalIncome: 1250000,
    totalExpenses: 450000,
    netIncome: 800000,
    cashFlowTrend: 800000,
    incomeGrowth: 15,
    expenseGrowth: -5,
    netIncomeGrowth: 10,
    cashFlowGrowth: 10,
    incomeBreakdown: {
      loanDisbursements: 950000,
      fines: 200000,
      processingFees: 100000
    },
    expenseBreakdown: {
      operational: 250000,
      salaries: 150000,
      marketing: 50000
    }
  });


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatGrowth = (percentage) => {
    const isPositive = percentage > 0;
    return (
      <span className={`growth-indicator ${isPositive ? 'positive' : 'negative'}`}>
        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {isPositive ? '+' : ''}{percentage}%
      </span>
    );
  };

  const calculatePercentage = (value, total) => {
    return ((value / total) * 100).toFixed(1);
  };

  const handleGenerateReport = () => {
    // Simulate generating a financial report
    const reportData = {
      dateRange,
      totalIncome: financialData.totalIncome,
      totalExpenses: financialData.totalExpenses,
      netProfit: financialData.netIncome
    };
    
    console.log('Generating financial report:', reportData);
    // In a real app, this would trigger a download or navigation to report page
    alert('Financial report generated successfully!');
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="page-header">
          <div className="header-content">
            <h1>Financial Dashboard</h1>
            <p className="page-description">Overview of company's financial status</p>
          </div>
        </div>

        <div className="financial-content">
          {/* Search Bar */}
          <div className="search-section">
            <div className="search-box">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Search transactions"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Key Metrics */}
          <div className="metrics-section">
            <h2>Key Metrics</h2>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-header">
                  <h3>Total Income</h3>
                </div>
                <div className="metric-value">{formatCurrency(financialData.totalIncome)}</div>
                <div className="metric-growth">
                  {formatGrowth(financialData.incomeGrowth)}
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <h3>Total Expenses</h3>
                </div>
                <div className="metric-value">{formatCurrency(financialData.totalExpenses)}</div>
                <div className="metric-growth">
                  {formatGrowth(financialData.expenseGrowth)}
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <h3>Net Income/Loss</h3>
                </div>
                <div className="metric-value">{formatCurrency(financialData.netIncome)}</div>
                <div className="metric-growth">
                  {formatGrowth(financialData.netIncomeGrowth)}
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <h3>Cash Flow Trend</h3>
                </div>
                <div className="metric-value">{formatCurrency(financialData.cashFlowTrend)}</div>
                <div className="metric-growth">
                  {formatGrowth(financialData.cashFlowGrowth)}
                </div>
              </div>
            </div>
          </div>

          {/* Income and Expense Breakdown */}
          <div className="breakdown-section">
            <div className="breakdown-grid">
              {/* Income Breakdown */}
              <div className="breakdown-card">
                <div className="breakdown-header">
                  <h2>Income Breakdown</h2>
                </div>
                <div className="breakdown-content">
                  <div className="breakdown-total">
                    <div className="total-amount">{formatCurrency(financialData.totalIncome)}</div>
                    <div className="total-subtitle">This Year {formatGrowth(financialData.incomeGrowth)}</div>
                  </div>
                  
                  <div className="breakdown-chart">
                    <div className="chart-container">
                      <div className="chart-placeholder">
                        <PieChart size={120} className="chart-icon" />
                      </div>
                    </div>
                    
                    <div className="breakdown-items">
                      <div className="breakdown-item">
                        <div className="item-indicator loan-disbursements"></div>
                        <div className="item-details">
                          <div className="item-label">Loan Disbursements</div>
                          <div className="item-amount">{formatCurrency(financialData.incomeBreakdown.loanDisbursements)}</div>
                          <div className="item-percentage">
                            {calculatePercentage(financialData.incomeBreakdown.loanDisbursements, financialData.totalIncome)}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="breakdown-item">
                        <div className="item-indicator fines"></div>
                        <div className="item-details">
                          <div className="item-label">Fines</div>
                          <div className="item-amount">{formatCurrency(financialData.incomeBreakdown.fines)}</div>
                          <div className="item-percentage">
                            {calculatePercentage(financialData.incomeBreakdown.fines, financialData.totalIncome)}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="breakdown-item">
                        <div className="item-indicator processing-fees"></div>
                        <div className="item-details">
                          <div className="item-label">Processing Fees</div>
                          <div className="item-amount">{formatCurrency(financialData.incomeBreakdown.processingFees)}</div>
                          <div className="item-percentage">
                            {calculatePercentage(financialData.incomeBreakdown.processingFees, financialData.totalIncome)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expense Breakdown */}
              <div className="breakdown-card">
                <div className="breakdown-header">
                  <h2>Expense Breakdown</h2>
                </div>
                <div className="breakdown-content">
                  <div className="breakdown-total">
                    <div class="expense-header">
                      <h3>Expense Categories</h3>
                    </div>
                    <div className="total-amount">{formatCurrency(financialData.totalExpenses)}</div>
                    <div className="total-subtitle">This Year {formatGrowth(financialData.expenseGrowth)}</div>
                  </div>
                  
                  <div className="expense-bars">
                    <div className="expense-item">
                      <div className="expense-label">Operational Expenses</div>
                      <div className="expense-bar">
                        <div 
                          className="expense-fill operational"
                          style={{ 
                            width: `${calculatePercentage(financialData.expenseBreakdown.operational, financialData.totalExpenses)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="expense-amount">{formatCurrency(financialData.expenseBreakdown.operational)}</div>
                    </div>
                    
                    <div className="expense-item">
                      <div className="expense-label">Salaries</div>
                      <div className="expense-bar">
                        <div 
                          className="expense-fill salaries"
                          style={{ 
                            width: `${calculatePercentage(financialData.expenseBreakdown.salaries, financialData.totalExpenses)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="expense-amount">{formatCurrency(financialData.expenseBreakdown.salaries)}</div>
                    </div>
                    
                    <div className="expense-item">
                      <div className="expense-label">Marketing</div>
                      <div className="expense-bar">
                        <div 
                          className="expense-fill marketing"
                          style={{ 
                            width: `${calculatePercentage(financialData.expenseBreakdown.marketing, financialData.totalExpenses)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="expense-amount">{formatCurrency(financialData.expenseBreakdown.marketing)}</div>
                    </div>
                  </div>
                  
                  <div className="expense-actions">
                    <button className="view-table-btn" onClick={() => navigate('/expenses/all')}>
                      <Eye size={16} />
                      View Expenses Table
                    </button>
                    <button className="add-expense-btn" onClick={() => navigate('/expenses/record')}>
                      <Plus size={16} />
                      Add New Expense
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Net Profit Section */}
          <div className="net-profit-section">
            <div className="net-profit-card">
              <div className="profit-header">
                <h2>Net Profit</h2>
              </div>
              <div className="profit-content">
                <div className="profit-amount">{formatCurrency(financialData.netIncome)}</div>
                <div className="profit-growth">{formatGrowth(financialData.netIncomeGrowth)}</div>
              </div>
            </div>
          </div>

          {/* Reporting Section */}
          <div className="reporting-section">
            <h2>Reporting</h2>
            <div className="reporting-controls">
              <div className="date-range-section">
                <label htmlFor="dateRange">Date Range</label>
                <div className="date-range-input">
                  <select 
                    id="dateRange"
                    value={dateRange} 
                    onChange={(e) => setDateRange(e.target.value)}
                  >
                    <option value="this-month">This Month</option>
                    <option value="last-month">Last Month</option>
                    <option value="this-quarter">This Quarter</option>
                    <option value="last-quarter">Last Quarter</option>
                    <option value="this-year">This Year</option>
                    <option value="last-year">Last Year</option>
                    <option value="custom">Custom Range</option>
                  </select>
                  <ChevronDown size={16} className="select-icon" />
                </div>
              </div>
              
              <button className="generate-report-btn" onClick={handleGenerateReport}>
                <Download size={16} />
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FinancialDashboard;
