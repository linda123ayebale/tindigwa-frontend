import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import LoanProductService from './LoanProductService';
import NotificationModal from '../../components/NotificationModal';
import { useNotification } from '../../hooks/useNotification';
import Sidebar from '../../components/Layout/Sidebar';
import './EditLoanProduct.css';

const EditLoanProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { notification, showSuccess, showError, hideNotification } = useNotification();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    interestMethod: 'flat',
    interestRate: '',
    ratePer: 'month',
    defaultFrequency: 'monthly',
    processingFee: '',
    lateFee: '',
    minAmount: '',
    maxAmount: '',
    registrationFeeTiers: [],
    penaltyRate: ''
  });

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        let product = location.state?.product;
        
        if (!product) {
          product = await LoanProductService.getById(id);
        }
        
        setFormData({
          name: product.productName || '',
          code: product.productCode || '',
          description: product.description || '',
          interestMethod: product.interestMethod || 'flat',
          interestRate: product.defaultInterestRate || '',
          ratePer: product.ratePer || 'month',
          defaultFrequency: product.defaultRepaymentFrequency || 'monthly',
          processingFee: product.processingFeeValue || '',
          lateFee: product.lateFee || '',
          minAmount: product.minAmount || '',
          maxAmount: product.maxAmount || '',
          registrationFeeTiers: product.registrationFeeTiers || [],
          penaltyRate: product.penaltyRate || ''
        });
      } catch (error) {
        console.error('Error loading product:', error);
        showError('Failed to load product details');
        navigate('/loans/products');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, location.state, navigate, showError]);

  const validate = () => {
    const e = {};
    if (!formData.name?.trim()) e.name = 'Product name is required';
    if (!formData.code?.trim()) e.code = 'Product code is required';
    if (!formData.interestRate || isNaN(formData.interestRate) || parseFloat(formData.interestRate) < 0) {
      e.interestRate = 'Valid interest rate is required';
    }
    if (formData.processingFee && (isNaN(formData.processingFee) || parseFloat(formData.processingFee) < 0)) {
      e.processingFee = 'Valid processing fee is required';
    }
    if (formData.lateFee && (isNaN(formData.lateFee) || parseFloat(formData.lateFee) < 0)) {
      e.lateFee = 'Valid late fee is required';
    }
    if (formData.minAmount && (isNaN(formData.minAmount) || parseFloat(formData.minAmount) < 0)) {
      e.minAmount = 'Valid minimum amount is required';
    }
    if (formData.maxAmount && (isNaN(formData.maxAmount) || parseFloat(formData.maxAmount) < 0)) {
      e.maxAmount = 'Valid maximum amount is required';
    }
    if (formData.minAmount && formData.maxAmount && parseFloat(formData.minAmount) > parseFloat(formData.maxAmount)) {
      e.maxAmount = 'Maximum amount must be greater than minimum amount';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      // Build payload to match backend LoanProduct entity structure
      const payload = {
        productName: formData.name.trim(),
        productCode: formData.code.trim().toUpperCase(),
        description: formData.description?.trim() || '',
        defaultInterestRate: parseFloat(formData.interestRate),
        interestMethod: formData.interestMethod,
        interestType: 'percentage',
        ratePer: formData.ratePer,
        minDuration: 1,
        maxDuration: 36,
        durationUnit: 'months',
        defaultRepaymentFrequency: formData.defaultFrequency,
        allowedRepaymentFrequencies: 'daily,weekly,bi-weekly,monthly',
        processingFeeType: 'percentage',
        processingFeeValue: formData.processingFee ? parseFloat(formData.processingFee) : 0,
        lateFee: formData.lateFee ? parseFloat(formData.lateFee) : 0,
        defaultFee: 0,
        defaultGracePeriodDays: 0,
        registrationFeeTiers: formData.registrationFeeTiers || [],
        penaltyRate: formData.penaltyRate ? parseFloat(formData.penaltyRate) : null,
        requiresGuarantor: true,  // Always required for all loan products
        requiresCollateral: false, // Never required
        active: true
      };

      if (formData.minAmount) {
        payload.minAmount = parseFloat(formData.minAmount);
      }
      if (formData.maxAmount) {
        payload.maxAmount = parseFloat(formData.maxAmount);
      }

      await LoanProductService.update(id, payload);
      showSuccess('Loan product updated successfully');
      navigate('/loans/products');
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to update loan product';
      if (error.response?.data?.errors) {
        const serverErrors = error.response.data.errors;
        setErrors(prev => ({ ...prev, ...serverErrors }));
      }
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="loading">Loading product details...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <div className="page-header-centered">
          <button className="back-to-list-btn" onClick={() => navigate('/loans/products')}>
            <ArrowLeft size={18} />
            <span>Back to Products</span>
          </button>
          <div className="header-title-centered">
            <h1>Edit Loan Product</h1>
            <p className="subtitle">Update loan product details</p>
          </div>
        </div>

        <div className="edit-loan-product-container">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group span-2">
                <label>Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className={errors.name ? 'error' : ''}
                  placeholder="Enter product name"
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label>Product Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className={errors.code ? 'error' : ''}
                  placeholder="Enter product code"
                />
                {errors.code && <span className="error-message">{errors.code}</span>}
              </div>

              <div className="form-group">
                <label>Interest Method *</label>
                <select
                  value={formData.interestMethod}
                  onChange={e => setFormData({ ...formData, interestMethod: e.target.value })}
                >
                  <option value="flat">Flat</option>
                  <option value="reducing_equal_installments">Reducing - Equal Installments</option>
                  <option value="reducing_equal_principal">Reducing - Equal Principal</option>
                  <option value="interest_only">Interest Only</option>
                  <option value="compound">Compound</option>
                </select>
              </div>

              <div className="form-group">
                <label>Interest Rate (%) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.interestRate}
                  onChange={e => setFormData({ ...formData, interestRate: e.target.value })}
                  className={errors.interestRate ? 'error' : ''}
                  placeholder="Enter interest rate"
                />
                {errors.interestRate && <span className="error-message">{errors.interestRate}</span>}
              </div>

              <div className="form-group">
                <label>Rate Per *</label>
                <select
                  value={formData.ratePer}
                  onChange={e => setFormData({ ...formData, ratePer: e.target.value })}
                >
                  <option value="day">Per Day</option>
                  <option value="week">Per Week</option>
                  <option value="month">Per Month</option>
                  <option value="year">Per Year</option>
                </select>
              </div>

              <div className="form-group">
                <label>Default Frequency *</label>
                <select
                  value={formData.defaultFrequency}
                  onChange={e => setFormData({ ...formData, defaultFrequency: e.target.value })}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="bi-weekly">Bi-Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div className="form-group">
                <label>Processing Fee (%)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.processingFee}
                  onChange={e => setFormData({ ...formData, processingFee: e.target.value })}
                  className={errors.processingFee ? 'error' : ''}
                  placeholder="Enter processing fee"
                />
                {errors.processingFee && <span className="error-message">{errors.processingFee}</span>}
              </div>

              <div className="form-group">
                <label>Late Fee (%)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.lateFee}
                  onChange={e => setFormData({ ...formData, lateFee: e.target.value })}
                  className={errors.lateFee ? 'error' : ''}
                  placeholder="Enter late fee"
                />
                {errors.lateFee && <span className="error-message">{errors.lateFee}</span>}
              </div>

              <div className="form-group">
                <label>Minimum Amount (UGX)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.minAmount}
                  onChange={e => setFormData({ ...formData, minAmount: e.target.value })}
                  className={errors.minAmount ? 'error' : ''}
                  placeholder="Enter minimum amount"
                />
                {errors.minAmount && <span className="error-message">{errors.minAmount}</span>}
              </div>

              <div className="form-group">
                <label>Maximum Amount (UGX)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.maxAmount}
                  onChange={e => setFormData({ ...formData, maxAmount: e.target.value })}
                  className={errors.maxAmount ? 'error' : ''}
                  placeholder="Enter maximum amount"
                />
                {errors.maxAmount && <span className="error-message">{errors.maxAmount}</span>}
              </div>

              <div className="form-group span-2">
                <label>Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter detailed product description"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => navigate('/loans/products')}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                <Save size={16} /> {submitting ? 'Updating...' : 'Update Product'}
              </button>
            </div>
          </form>
        </div>
      </main>

      {notification && (
        <NotificationModal
          type={notification.type}
          message={notification.message}
          onClose={hideNotification}
        />
      )}
    </div>
  );
};

export default EditLoanProduct;
