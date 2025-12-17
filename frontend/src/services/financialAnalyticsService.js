import api from './api';

class FinancialAnalyticsService {
  /**
   * Get high-level analytics for the financial dashboard
   */
  static async getDashboardAnalytics() {
    try {
      const response = await api.get('/financial-analytics/dashboard');
      return response;
    } catch (error) {
      console.error('Error fetching financial analytics dashboard:', error);
      throw error;
    }
  }

  /**
   * Get category breakdown for the current month
   */
  static async getCategoryBreakdownCurrentMonth() {
    try {
      const response = await api.get('/financial-analytics/categories/current-month');
      return response;
    } catch (error) {
      console.error('Error fetching category breakdown:', error);
      throw error;
    }
  }

  /**
   * Get KPIs for a specified period (period string expected by backend)
   * e.g. 'current-month', 'current-quarter', 'current-year'
   */
  static async getKPIs(period = 'current-month') {
    try {
      const response = await api.get(`/financial-analytics/kpis?period=${encodeURIComponent(period)}`);
      return response;
    } catch (error) {
      console.error('Error fetching financial KPIs:', error);
      throw error;
    }
  }

  /**
   * Utility: format currency consistently across analytics
   */
  static formatCurrency(amount) {
    if (amount === null || amount === undefined) return 'UGX 0';
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
}

export default FinancialAnalyticsService;
