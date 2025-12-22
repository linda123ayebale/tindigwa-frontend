import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  BarChart3,
  TrendingUp,
  Calendar,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Download,
  Filter,
  RefreshCw,
  PieChart
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import Sidebar from '../../../components/Layout/Sidebar';
import './PaymentAnalytics.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PaymentAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days
  const [granularity, setGranularity] = useState('daily');
  const [analyticsData, setAnalyticsData] = useState({
    trends: null,
    methods: null,
    summary: null,
    latePayments: null,
    collectionEfficiency: null,
    portfolioHealth: null
  });

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const startDate = new Date(today.getTime() - parseInt(dateRange) * 24 * 60 * 60 * 1000);
      
      const formatDate = (date) => date.toISOString().split('T')[0];
      const start = formatDate(startDate);
      const end = formatDate(today);

      // Fetch all analytics in parallel
      const [trends, methods, summary, latePayments, collectionEfficiency, portfolioHealth] = await Promise.all([
        fetch(`http://localhost:8081/api/payments/analytics/trends?startDate=${start}&endDate=${end}&granularity=${granularity}`)
          .then(res => res.json()),
        fetch(`http://localhost:8081/api/payments/analytics/methods?startDate=${start}&endDate=${end}`)
          .then(res => res.json()),
        fetch(`http://localhost:8081/api/payments/analytics/summary?startDate=${start}&endDate=${end}`)
          .then(res => res.json()),
        fetch(`http://localhost:8081/api/payments/analytics/late-payments?startDate=${start}&endDate=${end}`)
          .then(res => res.json()),
        fetch(`http://localhost:8081/api/payments/analytics/collection-efficiency?startDate=${start}&endDate=${end}`)
          .then(res => res.json()),
        fetch(`http://localhost:8081/api/payments/analytics/portfolio-health`)
          .then(res => res.json())
      ]);

      setAnalyticsData({
        trends,
        methods,
        summary,
        latePayments,
        collectionEfficiency,
        portfolioHealth
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart configurations
  const trendChartData = {
    labels: analyticsData.trends?.data?.map(item => item.date) || [],
    datasets: [
      {
        label: 'Total Payments',
        data: analyticsData.trends?.data?.map(item => item.totalAmount) || [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Payment Count',
        data: analyticsData.trends?.data?.map(item => item.count) || [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: false,
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  };

  const trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return 'UGX ' + value.toLocaleString();
          }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        grid: {
          drawOnChartArea: false
        }
      }
    }
  };

  const methodChartData = {
    labels: analyticsData.methods?.methods?.map(item => item.method) || [],
    datasets: [
      {
        label: 'Total Amount',
        data: analyticsData.methods?.methods?.map(item => item.totalAmount) || [],
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#8b5cf6',
          '#ec4899',
          '#06b6d4',
          '#f43f5e'
        ]
      }
    ]
  };

  const methodChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      }
    }
  };

  const latePaymentChartData = {
    labels: Object.keys(analyticsData.latePayments?.latencyDistribution || {}),
    datasets: [
      {
        label: 'Late Payments by Range',
        data: Object.values(analyticsData.latePayments?.latencyDistribution || {}),
        backgroundColor: [
          '#fbbf24',
          '#f59e0b',
          '#ef4444',
          '#dc2626'
        ]
      }
    ]
  };

  const latePaymentChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };


  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="analytics-page">
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading analytics...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="analytics-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>
            <BarChart3 size={32} />
            Payment Analytics
          </h1>
          <p className="page-description">
            Track payment trends, analyze methods, and monitor performance
          </p>
        </div>
        <div className="header-actions">
          <div className="filter-group">
            <Filter size={16} />
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="date-range-select"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="60">Last 60 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
          <div className="filter-group">
            <Calendar size={16} />
            <select 
              value={granularity} 
              onChange={(e) => setGranularity(e.target.value)}
              className="date-range-select"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <button className="btn-secondary" onClick={fetchAnalytics}>
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="btn-secondary">
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card blue">
          <div className="card-icon">
            <DollarSign size={24} />
          </div>
          <div className="card-content">
            <span className="card-label">Total Collected</span>
            <span className="card-value">
              {formatCurrency(analyticsData.summary?.totalAmount || 0)}
            </span>
            <span className="card-trend positive">
              <ArrowUp size={14} />
              {analyticsData.summary?.totalPayments || 0} payments
            </span>
          </div>
        </div>

        <div className="summary-card green">
          <div className="card-icon">
            <TrendingUp size={24} />
          </div>
          <div className="card-content">
            <span className="card-label">Collection Rate</span>
            <span className="card-value">
              {(analyticsData.collectionEfficiency?.collectionRate || 0).toFixed(1)}%
            </span>
            <span className="card-trend positive">
              <ArrowUp size={14} />
              {analyticsData.collectionEfficiency?.paidInstallments || 0} paid
            </span>
          </div>
        </div>

        <div className="summary-card orange">
          <div className="card-icon">
            <Calendar size={24} />
          </div>
          <div className="card-content">
            <span className="card-label">Average Payment</span>
            <span className="card-value">
              {formatCurrency(analyticsData.summary?.averagePayment || 0)}
            </span>
            <span className="card-trend neutral">
              {analyticsData.summary?.totalPayments || 0} payments
            </span>
          </div>
        </div>

        <div className="summary-card red">
          <div className="card-icon">
            <AlertCircle size={24} />
          </div>
          <div className="card-content">
            <span className="card-label">Late Payments</span>
            <span className="card-value">
              {analyticsData.latePayments?.totalLatePayments || 0}
            </span>
            <span className="card-trend negative">
              <ArrowDown size={14} />
              {formatCurrency(analyticsData.latePayments?.totalFinesCollected || 0)} fines
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Payment Trends Chart */}
        <div className="chart-card large">
          <div className="chart-header">
            <h3>Payment Trends</h3>
            <p className="chart-description">
              Daily payment collection vs expected amounts
            </p>
          </div>
          <div className="chart-container">
            <Line data={trendChartData} options={trendChartOptions} />
          </div>
        </div>

        {/* Payment Methods Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Payment Methods</h3>
            <p className="chart-description">
              Distribution by payment type
            </p>
          </div>
          <div className="chart-container">
            <Doughnut data={methodChartData} options={methodChartOptions} />
          </div>
        </div>

        {/* Late Payments Trend */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Late Payments</h3>
            <p className="chart-description">
              Overdue payment occurrences
            </p>
          </div>
          <div className="chart-container">
            <Bar data={latePaymentChartData} options={latePaymentChartOptions} />
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="insights-section">
        <h3>Key Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon success">
              <TrendingUp size={20} />
            </div>
            <div className="insight-content">
              <h4>Strong Collection Rate</h4>
              <p>
                Your collection rate of {(analyticsData.collectionEfficiency?.collectionRate || 0).toFixed(1)}% 
                {(analyticsData.collectionEfficiency?.collectionRate || 0) >= 85 ? 'is above' : 'needs improvement from'} the industry average of 85%.
              </p>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon warning">
              <AlertCircle size={20} />
            </div>
            <div className="insight-content">
              <h4>Late Payment Alert</h4>
              <p>
                {analyticsData.latePayments?.totalLatePayments || 0} payments are overdue with an average of {(analyticsData.latePayments?.averageDaysLate || 0).toFixed(0)} days late. 
                Consider sending reminders to improve collection.
              </p>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon info">
              <PieChart size={20} />
            </div>
            <div className="insight-content">
              <h4>Portfolio Health</h4>
              <p>
                {analyticsData.portfolioHealth?.overdueRate ? 
                  `${(analyticsData.portfolioHealth.overdueRate).toFixed(1)}% of installments are overdue.` :
                  'Portfolio health is good with minimal overdue installments.'
                } Monitor regularly to maintain performance.
              </p>
            </div>
          </div>
        </div>
      </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentAnalytics;
