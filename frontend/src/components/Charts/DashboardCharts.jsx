import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import './DashboardCharts.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Theme colors (Blue, Yellow, White)
const COLORS = {
  primary: '#4285f4',     // Blue (system button color)
  secondary: '#FFD700',   // Yellow/Gold
  success: '#34a853',     // Green
  danger: '#ea4335',      // Red
  warning: '#fbbc04',     // Orange
  light: '#f8f9fa',       // Light gray
  white: '#ffffff'
};

// Chart options for consistency
const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 15,
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: COLORS.primary,
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: false
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 11
        }
      }
    },
    y: {
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      },
      ticks: {
        font: {
          size: 11
        }
      }
    }
  }
};

/**
 * Loans Released Monthly - Line Chart
 */
export const LoansReleasedChart = ({ data }) => {
  const chartData = {
    labels: data?.map(item => item.monthYear) || [],
    datasets: [
      {
        label: 'Loans Released',
        data: data?.map(item => item.amount) || [],
        borderColor: COLORS.danger,
        backgroundColor: 'rgba(234, 67, 53, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: COLORS.danger,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4
      }
    ]
  };

  const options = {
    ...commonOptions,
    scales: {
      ...commonOptions.scales,
      y: {
        ...commonOptions.scales.y,
        ticks: {
          ...commonOptions.scales.y.ticks,
          callback: function(value) {
            return 'UGX ' + value.toLocaleString();
          }
        }
      }
    }
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3>Loans Released - Monthly</h3>
        <div className="chart-indicator danger"></div>
      </div>
      <div className="chart-wrapper">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

/**
 * Loan Collections Monthly - Line Chart
 */
export const LoanCollectionsChart = ({ data }) => {
  const chartData = {
    labels: data?.map(item => item.monthYear) || [],
    datasets: [
      {
        label: 'Collections',
        data: data?.map(item => item.amount) || [],
        borderColor: COLORS.primary,
        backgroundColor: 'rgba(66, 133, 244, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: COLORS.primary,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4
      }
    ]
  };

  const options = {
    ...commonOptions,
    scales: {
      ...commonOptions.scales,
      y: {
        ...commonOptions.scales.y,
        ticks: {
          ...commonOptions.scales.y.ticks,
          callback: function(value) {
            return 'UGX ' + value.toLocaleString();
          }
        }
      }
    }
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3>Loan Collections - Monthly</h3>
        <div className="chart-indicator primary"></div>
      </div>
      <div className="chart-wrapper">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

/**
 * Past Maturity Loans Monthly - Bar Chart
 */
export const PastMaturityLoansChart = ({ data }) => {
  const chartData = {
    labels: data?.map(item => item.monthYear) || [],
    datasets: [
      {
        label: 'Past Maturity Loans',
        data: data?.map(item => item.count) || [],
        backgroundColor: COLORS.success,
        borderColor: COLORS.success,
        borderWidth: 0,
        borderRadius: 4
      }
    ]
  };

  const options = {
    ...commonOptions,
    scales: {
      ...commonOptions.scales,
      y: {
        ...commonOptions.scales.y,
        ticks: {
          ...commonOptions.scales.y.ticks,
          stepSize: 1,
          callback: function(value) {
            return value + ' loans';
          }
        }
      }
    }
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3>Past Maturity Date Loans - Monthly</h3>
        <div className="chart-indicator success"></div>
      </div>
      <div className="chart-wrapper">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

/**
 * Gender Distribution - Donut Chart
 */
export const GenderDistributionChart = ({ maleCount, femaleCount, malePercentage, femalePercentage }) => {
  const chartData = {
    labels: ['Male Borrowers', 'Female Borrowers'],
    datasets: [
      {
        data: [maleCount || 0, femaleCount || 0],
        backgroundColor: [COLORS.primary, '#FF69B4'], // Blue for male, Pink for female
        borderColor: [COLORS.primary, '#FF69B4'],
        borderWidth: 2,
        hoverBackgroundColor: [COLORS.primary, '#FF1493'],
        hoverBorderColor: '#ffffff'
      }
    ]
  };

  const options = {
    ...commonOptions,
    cutout: '60%',
    plugins: {
      ...commonOptions.plugins,
      legend: {
        ...commonOptions.plugins.legend,
        position: 'bottom'
      },
      tooltip: {
        ...commonOptions.plugins.tooltip,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const percentage = context.dataIndex === 0 ? malePercentage : femalePercentage;
            return `${label}: ${value} (${percentage?.toFixed(1) || 0}%)`;
          }
        }
      }
    },
    scales: {} // Remove scales for donut chart
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3>Active Male / Female Borrowers %</h3>
        <div className="chart-indicators">
          <div className="chart-indicator primary"></div>
          <div className="chart-indicator pink"></div>
        </div>
      </div>
      <div className="chart-wrapper donut-chart">
        <Doughnut data={chartData} options={options} />
        <div className="donut-center">
          <div className="donut-total">{(maleCount || 0) + (femaleCount || 0)}</div>
          <div className="donut-label">Total</div>
        </div>
      </div>
    </div>
  );
};

/**
 * Average Loan Tenure Card
 */
export const AverageLoanTenureCard = ({ averageDays }) => {
  return (
    <div className="tenure-card">
      <div className="tenure-content">
        <div className="tenure-value">{averageDays || 0} days</div>
        <div className="tenure-label">Average Loan Tenure</div>
        <div className="tenure-description">Average number of days for loans to be fully paid</div>
      </div>
      <div className="tenure-icon">
        📊
      </div>
    </div>
  );
};
