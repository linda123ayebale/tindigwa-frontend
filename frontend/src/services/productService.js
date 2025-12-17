import ApiService from './api';

class ProductService {
  constructor() {
    this.basePath = '/loan-products';
  }

  async getAll() {
    return ApiService.get(this.basePath);
  }

  async getById(id) {
    return ApiService.get(`${this.basePath}/${id}`);
  }

  async create(data) {
    return ApiService.post(this.basePath, data);
  }

  async update(id, data) {
    return ApiService.put(`${this.basePath}/${id}`, data);
  }

  async remove(id) {
    return ApiService.delete(`${this.basePath}/${id}`);
  }

  // Local fallback for development if backend not ready
  getMockProducts() {
    return [
      {
        id: 'prd_business',
        name: 'Business Loan',
        code: 'BUS',
        currency: 'UGX',
        interestMethod: 'reducing_equal_installments',
        interestRate: 13,
        ratePer: 'month',
        term: { defaultDays: 365, minDays: 30, maxDays: 1095 },
        repayment: { defaultFrequency: 'monthly', allowedFrequencies: ['weekly','bi-weekly','monthly'] },
        fees: [{ name: 'Processing Fee', type: 'percent', value: 2, financed: true }],
        penalties: {
          graceDays: 5,
          late: { type: 'percent_per_day', value: 0.2, capPercentOfOutstanding: 100 },
          afterMaturity: { type: 'percent_per_day', value: 0.3 }
        },
        firstRepayment: { allowManualDate: true, allowManualAmount: true },
        requirements: { collateralRequired: false, guarantorRequired: true },
        disbursementDefaults: { method: 'cash' },
        status: 'active'
      }
    ];
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new ProductService();
