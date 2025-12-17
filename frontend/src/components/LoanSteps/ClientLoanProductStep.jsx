import React from 'react';
import '../ClientSteps/StepStyles.css';
import './DropdownStyles.css';

const ClientLoanProductStep = ({ 
  formData, 
  updateFormData, 
  errors = {}, 
  loanProducts = [],
  selectedProduct,
  guarantorInfo,
  clients = [],
  loanOfficers = [],
  loadingProducts = false,
  loadingGuarantor = false,
  loadingLoanOfficers = false,
  onProductChange,
  onClientChange,
  onLoanOfficerChange
}) => {
  const [isProductDropdownOpen, setIsProductDropdownOpen] = React.useState(false);
  const [isClientDropdownOpen, setIsClientDropdownOpen] = React.useState(false);
  const [isLoanOfficerDropdownOpen, setIsLoanOfficerDropdownOpen] = React.useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'productId') {
      onProductChange?.(value);
      setIsProductDropdownOpen(false);
    } else if (name === 'clientId') {
      onClientChange?.(value);
      setIsClientDropdownOpen(false);
    } else if (name === 'loanOfficerId') {
      onLoanOfficerChange?.(value);
      setIsLoanOfficerDropdownOpen(false);
    } else {
      updateFormData({ [name]: value });
    }
  };

  const handleDropdownFocus = (dropdownType) => {
    if (dropdownType === 'product') {
      setIsProductDropdownOpen(true);
      setIsClientDropdownOpen(false);
      setIsLoanOfficerDropdownOpen(false);
    } else if (dropdownType === 'client') {
      setIsClientDropdownOpen(true);
      setIsProductDropdownOpen(false);
      setIsLoanOfficerDropdownOpen(false);
    } else if (dropdownType === 'loanOfficer') {
      setIsLoanOfficerDropdownOpen(true);
      setIsProductDropdownOpen(false);
      setIsClientDropdownOpen(false);
    }
  };

  const handleDropdownBlur = (dropdownType) => {
    // Small delay to allow selection to complete
    setTimeout(() => {
      if (dropdownType === 'product') {
        setIsProductDropdownOpen(false);
      } else if (dropdownType === 'client') {
        setIsClientDropdownOpen(false);
      } else if (dropdownType === 'loanOfficer') {
        setIsLoanOfficerDropdownOpen(false);
      }
    }, 150);
  };



  return (
    <div className="step-container">
      <div className="step-header">
        <h2>Client Selection & Loan Product</h2>
        <p>Select the borrower and choose the appropriate loan product</p>
      </div>

      <div className="step-form">
        <div className="form-grid">
          {/* Loan Product Selection */}
          <div className="form-group full-width">
            <label htmlFor="productId" className="form-label">
              Loan Product <span className="required">*</span>
            </label>
            <select
              id="productId"
              name="productId"
              value={formData.productId || ''}
              onChange={handleChange}
              onFocus={() => handleDropdownFocus('product')}
              onBlur={() => handleDropdownBlur('product')}
              className={`form-input form-select ${errors.productId ? 'error' : ''} ${isProductDropdownOpen ? 'dropdown-active' : ''}`}
              disabled={loadingProducts || isClientDropdownOpen}
              required
            >
              <option value="">
                {loadingProducts ? 'Loading products...' : 'Select Loan Product'}
              </option>
              {!loadingProducts && loanProducts.map(product => (
                <option key={product.id} value={product.id}>
                  {product.productName} ({product.productCode}) - {product.defaultInterestRate}% per {product.ratePer}
                  {product.minAmount && product.maxAmount ? 
                    ` | ${(product.minAmount/1000)}K - ${(product.maxAmount/1000000)}M` : ''}
                  </option>
              ))}
            </select>
            {errors.productId && <span className="error-message">{errors.productId}</span>}
          </div>

          {/* Client Selection */}
          <div className="form-group">
            <label htmlFor="clientId" className="form-label">
              Select Client <span className="required">*</span>
            </label>
            <select
              id="clientId"
              name="clientId"
              value={formData.clientId || ''}
              onChange={handleChange}
              onFocus={() => handleDropdownFocus('client')}
              onBlur={() => handleDropdownBlur('client')}
              className={`form-input form-select ${errors.clientId ? 'error' : ''} ${isClientDropdownOpen ? 'dropdown-active' : ''}`}
              disabled={isProductDropdownOpen}
              required
            >
              <option value="">Select a client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.fullName || (client.firstName + ' ' + client.lastName)}
                </option>
              ))}
            </select>
            {errors.clientId && <span className="error-message">{errors.clientId}</span>}
          </div>

          {/* Loan Officer Selection */}
          <div className="form-group">
            <label htmlFor="loanOfficerId" className="form-label">
              Loan Officer <span className="optional">(Optional)</span>
            </label>
            <select
              id="loanOfficerId"
              name="loanOfficerId"
              value={formData.loanOfficerId || ''}
              onChange={handleChange}
              onFocus={() => handleDropdownFocus('loanOfficer')}
              onBlur={() => handleDropdownBlur('loanOfficer')}
              className={`form-input form-select ${errors.loanOfficerId ? 'error' : ''} ${isLoanOfficerDropdownOpen ? 'dropdown-active' : ''}`}
              disabled={loadingLoanOfficers || isProductDropdownOpen || isClientDropdownOpen}
            >
              <option value="">
                {loadingLoanOfficers ? 'Loading loan officers...' : 'Select Loan Officer (Optional)'}
              </option>
              {!loadingLoanOfficers && loanOfficers.map(officer => (
                <option key={officer.id} value={officer.id}>
                  {officer.fullName || officer.name} {officer.person?.contact ? `- ${officer.person.contact}` : ''}
                </option>
              ))}
            </select>
            {errors.loanOfficerId && <span className="error-message">{errors.loanOfficerId}</span>}
          </div>

        </div>

        {/* Product Information Display */}
        {selectedProduct && (
          <div className="info-section">
            <h3>Selected Product Details</h3>
            <div className="product-info">
              <div className="product-details-grid">
                <div className="detail-item">
                  <span className="detail-label">Product Name:</span>
                  <span className="detail-value">{selectedProduct.productName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Product Code:</span>
                  <span className="detail-value">{selectedProduct.productCode || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Interest Method:</span>
                  <span className="detail-value">{selectedProduct.interestMethod || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Interest Rate:</span>
                  <span className="detail-value">
                    {selectedProduct.defaultInterestRate}% per {selectedProduct.ratePer}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Amount Range:</span>
                  <span className="detail-value">
                    {selectedProduct.minAmount?.toLocaleString()} - {selectedProduct.maxAmount?.toLocaleString()}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Duration Range:</span>
                  <span className="detail-value">
                    {selectedProduct.minDuration} - {selectedProduct.maxDuration} {selectedProduct.durationUnit}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Default Frequency:</span>
                  <span className="detail-value">
                    {selectedProduct.defaultRepaymentFrequency}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Grace Period:</span>
                  <span className="detail-value">
                    {selectedProduct.defaultGracePeriodDays} days
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Guarantor Information Display */}
        {formData.clientId && (
          <div className="info-section">
            <h3>Guarantor Information</h3>
            {loadingGuarantor ? (
              <div className="loading-message">Loading guarantor information...</div>
            ) : guarantorInfo ? (
              <div className="guarantor-info">
                <div className="guarantor-form-grid">
                  <div className="form-group">
                    <label className="form-label">Guarantor Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={guarantorInfo.fullName || 'N/A'}
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={guarantorInfo.phoneNumber || 'N/A'}
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Relationship</label>
                    <input
                      type="text"
                      className="form-input"
                      value={guarantorInfo.relationship || 'N/A'}
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-input"
                      value={guarantorInfo.fullAddress || 'N/A'}
                      readOnly
                    />
                  </div>
                  {guarantorInfo.occupation && (
                    <div className="form-group">
                      <label className="form-label">Occupation</label>
                      <input
                        type="text"
                        className="form-input"
                        value={guarantorInfo.occupation}
                        readOnly
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="no-guarantor-message">
                <p>No guarantor information found for this client.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientLoanProductStep;