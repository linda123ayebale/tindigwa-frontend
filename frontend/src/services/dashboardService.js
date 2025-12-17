import api from './api';

class DashboardService {
  /**
   * Get complete dashboard statistics
   */
  static async getDashboardStatistics() {
    try {
      const response = await api.get('/dashboard');
      return response;
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      throw error;
    }
  }

  /**
   * Get dashboard summary (lighter version)
   */
  static async getDashboardSummary() {
    try {
      const response = await api.get('/dashboard/summary');
      return response;
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw error;
    }
  }

  /**
   * Get loan status breakdown
   */
  static async getLoanStatusBreakdown() {
    try {
      const response = await api.get('/dashboard/loan-status');
      return response;
    } catch (error) {
      console.error('Error fetching loan status breakdown:', error);
      throw error;
    }
  }

  /**
   * Get dashboard cards data
   */
  static async getDashboardCards() {
    try {
      const response = await api.get('/dashboard/cards');
      return response;
    } catch (error) {
      console.error('Error fetching dashboard cards:', error);
      throw error;
    }
  }

  /**
   * Format currency for UGX
   */
  static formatCurrency(amount) {
    if (!amount && amount !== 0) return 'UGX 0';
    
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Format large numbers with K, M suffixes
   */
  static formatNumber(num) {
    if (!num && num !== 0) return '0';
    
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  /**
   * Get formatted date
   */
  static formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-UG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

export default DashboardService;
