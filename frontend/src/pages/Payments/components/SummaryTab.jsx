import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, BarChart3, Calendar, PieChart, Activity, AlertTriangle } from 'lucide-react';
import api from '../../../services/api';
import paymentStore from '../../../services/paymentStore';

const SummaryTab = ({ loans, showToast }) => {
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState({
    payments: {
      total: 0,
      count: 0,
      thisMonth: 0
    },
    expenses: {
      total: 0,
      count: 0,
      thisMonth: 0
    }
  });
  const [analyticsData, setAnalyticsData] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [kpiData, setKpiData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');

  // Fetch comprehensive financial summary data
  const fetchSummaryData = async () => {
    setLoading(true);
    try {
      // Get current date range
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Fetch basic payments and expenses data
      let payments = [];
      try {
        const paymentsResponse = await api.get('/payments');
        payments = Array.isArray(paymentsResponse) ? paymentsResponse : [];
      } catch (error) {
        console.log('Using local payments data');
        payments = paymentStore.getAllPayments();
      }

      let expenses = [];
      try {
        const expensesResponse = await api.get('/expenses');
        expenses = Array.isArray(expensesResponse) ? expensesResponse : [];
      } catch (error) {
        console.log('No expenses data available');
        expenses = [];
      }

      // Calculate basic summary
      const paymentsThisMonth = payments.filter(payment => {
        const paymentDate = new Date(payment.paymentDate || payment.createdAt);
        return paymentDate >= startOfMonth && paymentDate <= endOfMonth;
      });

      const expensesThisMonth = expenses.filter(expense => {
        const expenseDate = new Date(expense.expenseDate);
        return expenseDate >= startOfMonth && expenseDate <= endOfMonth;
      });

      setSummaryData({
        payments: {
          total: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
          count: payments.length,
          thisMonth: paymentsThisMonth.reduce((sum, p) => sum + (p.amount || 0), 0)
        },
        expenses: {
          total: expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
          count: expenses.length,
          thisMonth: expensesThisMonth.reduce((sum, e) => sum + (e.amount || 0), 0)
        }
      });

      // Fetch advanced analytics
      await fetchAnalyticsData();
      await fetchCategoryData();
      await fetchKPIData();

    } catch (error) {
      console.error('Error fetching summary data:', error);
      showToast('Failed to fetch financial summary', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      const response = await api.get('/financial-analytics/dashboard');
      if (response && response.data) {
        setAnalyticsData(response);
      }
    } catch (error) {
      console.log('Analytics data not available:', error);
    }
  };

  // Fetch category breakdown
  const fetchCategoryData = async () => {
    try {
      const response = await api.get('/financial-analytics/categories/current-month');
      if (response) {
        setCategoryData(response);
      }
    } catch (error) {
      console.log('Category data not available:', error);
    }
  };

  // Fetch KPI data
  const fetchKPIData = async () => {
    try {
      const response = await api.get(`/financial-analytics/kpis?period=${selectedPeriod}`);
      if (response) {
        setKpiData(response);
      }
    } catch (error) {
      console.log('KPI data not available:', error);
    }
  };

  useEffect(() => {
    fetchSummaryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loans]);

  // Refetch KPI data when period changes
  useEffect(() => {
    if (selectedPeriod) {
      fetchKPIData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod]);

  const netIncome = summaryData.payments.total - summaryData.expenses.total;
  const netIncomeThisMonth = summaryData.payments.thisMonth - summaryData.expenses.thisMonth;
  const profitMargin = summaryData.payments.total > 0 ? 
    ((netIncome / summaryData.payments.total) * 100).toFixed(1) : 0;

  // Period options
  const periodOptions = [
    { value: 'current-week', label: 'This Week' },
    { value: 'current-month', label: 'This Month' },
    { value: 'current-quarter', label: 'This Quarter' },
    { value: 'current-year', label: 'This Year' }
  ];

  return (
    <div className="summary-tab">
      {loading ? (
        <div className="empty-state">
          <div className="loading">Loading financial analytics...</div>
        </div>
      ) : (
        <div className="financial-summary">
          {/* Period Selector */}
          <div className="period-selector">
            <Calendar size={20} />
            <span>Analysis Period:</span>
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="period-select"
            >
              {periodOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* KPI Section */}
          {kpiData && (
            <div className="kpi-section">
              <h3>Key Performance Indicators</h3>
              <div className="kpi-cards">
                <div className="kpi-card">
                  <div className="kpi-header">
                    <DollarSign className="kpi-icon" />
                    <span>Total Expenses</span>
                  </div>
                  <div className="kpi-value">UGX {kpiData.totalExpenses?.toLocaleString() || '0'}</div>
                  <div className="kpi-trend">
                    <span className={`trend-${kpiData.trendDirection?.toLowerCase() || 'stable'}`}>
                      {kpiData.trendDirection || 'Stable'} ({kpiData.growthRate?.toFixed(1) || '0'}%)
                    </span>
                  </div>
                </div>
                
                <div className="kpi-card">
                  <div className="kpi-header">
                    <Activity className="kpi-icon" />
                    <span>Transaction Count</span>
                  </div>
                  <div className="kpi-value">{kpiData.expenseCount || 0}</div>
                  <div className="kpi-trend">
                    <span>Average: UGX {kpiData.averageExpense?.toLocaleString() || '0'}</span>
                  </div>
                </div>
                
                <div className="kpi-card">
                  <div className="kpi-header">
                    <BarChart3 className="kpi-icon" />
                    <span>Volatility</span>
                  </div>
                  <div className="kpi-value">{kpiData.volatility?.toFixed(1) || '0'}%</div>
                  <div className="kpi-trend">
                    <span className={kpiData.volatility > 20 ? 'high-volatility' : 'low-volatility'}>
                      {kpiData.volatility > 20 ? 'High Variation' : 'Stable Pattern'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Overview Cards */}
          <div className="summary-cards">
            <div className="summary-card income">
              <div className="card-header">
                <h3>Total Income</h3>
                <TrendingUp className="card-icon" />
              </div>
              <div className="card-content">
                <div className="main-amount">UGX {summaryData.payments.total.toLocaleString()}</div>
                <div className="sub-info">{summaryData.payments.count} payments</div>
                <div className="month-info">
                  This month: UGX {summaryData.payments.thisMonth.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="summary-card expenses">
              <div className="card-header">
                <h3>Total Expenses</h3>
                <TrendingDown className="card-icon" />
              </div>
              <div className="card-content">
                <div className="main-amount">UGX {summaryData.expenses.total.toLocaleString()}</div>
                <div className="sub-info">{summaryData.expenses.count} expenses</div>
                <div className="month-info">
                  This month: UGX {summaryData.expenses.thisMonth.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="summary-card net-income">
              <div className="card-header">
                <h3>Net Income</h3>
                <DollarSign className="card-icon" />
              </div>
              <div className="card-content">
                <div className={`main-amount ${netIncome >= 0 ? 'positive' : 'negative'}`}>
                  UGX {netIncome.toLocaleString()}
                </div>
                <div className="sub-info">Profit Margin: {profitMargin}%</div>
                <div className={`month-info ${netIncomeThisMonth >= 0 ? 'positive' : 'negative'}`}>
                  This month: UGX {netIncomeThisMonth.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Category Analysis */}
          {categoryData && (
            <div className="category-analysis">
              <div className="section-header">
                <PieChart className="section-icon" />
                <h3>Expense Categories (Current Month)</h3>
              </div>
              
              <div className="category-cards">
                {categoryData.topCategories?.slice(0, 4).map((category, index) => (
                  <div key={category.category} className="category-card">
                    <div className="category-header">
                      <span className="category-name">{category.category}</span>
                      <span className="category-percentage">{category.percentage?.toFixed(1)}%</span>
                    </div>
                    <div className="category-amount">UGX {category.amount?.toLocaleString()}</div>
                    <div className="category-bar">
                      <div 
                        className="category-fill" 
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )) || (
                  <div className="no-data">
                    <AlertTriangle size={24} />
                    <p>No category data available</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics Insights */}
          {analyticsData && (
            <div className="insights-section">
              <div className="section-header">
                <Activity className="section-icon" />
                <h3>Financial Insights</h3>
              </div>
              
              <div className="insights-grid">
                <div className="insight-card">
                  <h4>Monthly Comparison</h4>
                  <div className="comparison-data">
                    {analyticsData.currentMonth && analyticsData.previousMonth ? (
                      <>
                        <div className="current-month">
                          <span>This Month:</span>
                          <span>UGX {analyticsData.currentMonth.totals?.totalExpenses?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="previous-month">
                          <span>Last Month:</span>
                          <span>UGX {analyticsData.previousMonth.totals?.totalExpenses?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="month-change">
                          {(() => {
                            const current = analyticsData.currentMonth.totals?.totalExpenses || 0;
                            const previous = analyticsData.previousMonth.totals?.totalExpenses || 0;
                            const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;
                            return (
                              <span className={change >= 0 ? 'increase' : 'decrease'}>
                                {change >= 0 ? '+' : ''}{change.toFixed(1)}% from last month
                              </span>
                            );
                          })()
                          }
                        </div>
                      </>
                    ) : (
                      <p>Comparison data not available</p>
                    )}
                  </div>
                </div>

                <div className="insight-card">
                  <h4>Year to Date</h4>
                  <div className="ytd-data">
                    {analyticsData.yearToDate ? (
                      <>
                        <div className="ytd-total">
                          <span>Total YTD:</span>
                          <span>UGX {analyticsData.yearToDate.totals?.totalExpenses?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="ytd-count">
                          <span>Transactions:</span>
                          <span>{analyticsData.yearToDate.totals?.expenseCount || 0}</span>
                        </div>
                      </>
                    ) : (
                      <p>YTD data not available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button className="action-btn" onClick={() => showToast('Feature coming soon!', 'info')}>
                <TrendingUp size={20} />
                Generate Report
              </button>
              <button className="action-btn" onClick={() => showToast('Feature coming soon!', 'info')}>
                <BarChart3 size={20} />
                Detailed Analytics
              </button>
              <button className="action-btn" onClick={() => showToast('Feature coming soon!', 'info')}>
                <DollarSign size={20} />
                Export Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryTab;