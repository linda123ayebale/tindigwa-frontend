import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import './EditLoanModal.css';

const EditLoanModal = ({ loan, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    branch: '',
    amount: '',
    duration: '',
    frequency: '',
    interestRate: '',
    startDate: '',
    officer: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-populate form data when modal opens
  useEffect(() => {
    if (loan && isOpen) {
      setFormData({
        clientId: loan.clientId || '',
        clientName: loan.clientName || '',
        branch: loan.branch || '',
        amount: loan.amount || '',
        duration: loan.duration || '',
        frequency: loan.frequency || '',
        interestRate: loan.interestRate || '',
        startDate: loan.startDate || '',
        officer: loan.officer || '',
      });
      setErrors({});
    }
  }, [loan, isOpen]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.clientId.trim()) {
      newErrors.clientId = 'Client ID is required';
    }

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Client Name is required';
    }

    if (!formData.branch) {
      newErrors.branch = 'Lending Branch is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }

    if (!formData.duration || parseInt(formData.duration) <= 0) {
      newErrors.duration = 'Valid duration is required';
    }

    if (!formData.frequency) {
      newErrors.frequency = 'Repayment frequency is required';
    }

    if (!formData.interestRate || parseFloat(formData.interestRate) < 0) {
      newErrors.interestRate = 'Valid interest rate is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.officer.trim()) {
      newErrors.officer = 'Loan officer name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare updated loan data
      const updatedLoan = {
        ...loan,
        clientId: formData.clientId,
        clientName: formData.clientName,
        branch: formData.branch,
        amount: parseFloat(formData.amount),
        duration: parseInt(formData.duration),
        frequency: formData.frequency,
        interestRate: parseFloat(formData.interestRate),
        startDate: formData.startDate,
        officer: formData.officer,
        lastUpdated: new Date().toISOString()
      };

      await onSave(updatedLoan);
      onClose();
    } catch (error) {
      console.error('Error updating loan:', error);
      // You can add error handling here, like showing a toast notification
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        clientId: '',
        clientName: '',
        branch: '',
        amount: '',
        duration: '',
        frequency: '',
        interestRate: '',
        startDate: '',
        officer: '',
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Loan</h2>
          <button 
            className="modal-close-btn" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-section">
              <h3>Loan Information</h3>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Client ID</label>
                  <input
                    type="text"
                    name="clientId"
                    value={formData.clientId}
                    onChange={handleInputChange}
                    className={`form-input ${errors.clientId ? 'error' : ''}`}
                    placeholder="Enter Client ID"
                    disabled={isSubmitting}
                  />
                  {errors.clientId && <span className="error-text">{errors.clientId}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Client Name</label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    className={`form-input ${errors.clientName ? 'error' : ''}`}
                    placeholder="Enter Client Name"
                    disabled={isSubmitting}
                  />
                  {errors.clientName && <span className="error-text">{errors.clientName}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Lending Branch</label>
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    className={`form-input ${errors.branch ? 'error' : ''}`}
                    disabled={isSubmitting}
                  >
                    <option value="">Select Branch</option>
                    {branches.map((branch, index) => (
                      <option key={index} value={branch}>{branch}</option>
                    ))}
                  </select>
                  {errors.branch && <span className="error-text">{errors.branch}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Amount Disbursed</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className={`form-input ${errors.amount ? 'error' : ''}`}
                    placeholder="Enter Amount"
                    min="0"
                    step="0.01"
                    disabled={isSubmitting}
                  />
                  {errors.amount && <span className="error-text">{errors.amount}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Loan Duration (Days)</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className={`form-input ${errors.duration ? 'error' : ''}`}
                    placeholder="Enter loan duration in days"
                    min="1"
                    disabled={isSubmitting}
                  />
                  {errors.duration && <span className="error-text">{errors.duration}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Repayment Frequency</label>
                  <select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleInputChange}
                    className={`form-input ${errors.frequency ? 'error' : ''}`}
                    disabled={isSubmitting}
                  >
                    <option value="">Select Frequency</option>
                    {frequencies.map((frequency, index) => (
                      <option key={index} value={frequency}>{frequency}</option>
                    ))}
                  </select>
                  {errors.frequency && <span className="error-text">{errors.frequency}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Interest Rate (%)</label>
                  <input
                    type="number"
                    name="interestRate"
                    value={formData.interestRate}
                    onChange={handleInputChange}
                    className={`form-input ${errors.interestRate ? 'error' : ''}`}
                    placeholder="Enter interest rate percentage"
                    min="0"
                    max="100"
                    step="0.01"
                    disabled={isSubmitting}
                  />
                  {errors.interestRate && <span className="error-text">{errors.interestRate}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`form-input ${errors.startDate ? 'error' : ''}`}
                    disabled={isSubmitting}
                  />
                  {errors.startDate && <span className="error-text">{errors.startDate}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Loan Officer Name</label>
                  <input
                    type="text"
                    name="officer"
                    value={formData.officer}
                    onChange={handleInputChange}
                    className={`form-input ${errors.officer ? 'error' : ''}`}
                    placeholder="Enter Officer Name"
                    disabled={isSubmitting}
                  />
                  {errors.officer && <span className="error-text">{errors.officer}</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-save"
              disabled={isSubmitting}
            >
              <Save size={16} />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLoanModal;
