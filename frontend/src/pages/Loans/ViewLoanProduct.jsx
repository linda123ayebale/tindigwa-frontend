import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';
import LoanProductService from './LoanProductService';
import AuthService from '../../services/authService';
import Sidebar from '../../components/Layout/Sidebar';
import './ViewLoanProduct.css';

const ViewLoanProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to use state first, otherwise fetch from API
        let productData = location.state?.product;
        
        if (!productData || productData.id !== parseInt(id)) {
          console.log('Fetching product from API...');
          productData = await LoanProductService.getById(id);
        }
        
        setProduct(productData);
      } catch (err) {
        console.error('Error loading product:', err);
        setError(err.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, location.state]);

  const formatCurrency = (amount) => {
    return `UGX ${Number(amount || 0).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="loading-state">
            <div className="loading">Loading product details...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="error-state">
            <Package size={48} />
            <h3>Product Not Found</h3>
            <p>{error || 'The product you are looking for does not exist.'}</p>
            <button className="back-btn" onClick={() => navigate('/loans/products')}>
              <ArrowLeft size={16} />
              Back to Products
            </button>
          </div>
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
            <h1>Loan Product Details</h1>
            <p className="subtitle">{product.name || product.productName || 'View product information'}</p>
          </div>
        </div>

        <div className="view-product-container">
          <div className="details-grid">
            {/* Basic Information Section */}
            <div className="details-section span-2">
              <h2>Basic Information</h2>
              <div className="info-grid">
                <div className="info-item">
                  <label>Product Name</label>
                  <span>{product.name || product.productName || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>Product Code</label>
                  <span className="product-code-badge">{product.code || product.productCode || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>Description</label>
                  <span>{product.description || 'No description provided'}</span>
                </div>
                <div className="info-item">
                  <label>Status</label>
                  <span className={`status-badge ${product.active ? 'status-active' : 'status-inactive'}`}>
                    {product.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Interest Configuration Section */}
            <div className="details-section">
              <h2>Interest Configuration</h2>
              <div className="info-grid">
                <div className="info-item">
                  <label>Interest Method</label>
                  <span className="capitalize">{product.interestMethod || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>Interest Rate</label>
                  <span className="highlight-value">{product.interestRate || product.defaultInterestRate || 0}%</span>
                </div>
                <div className="info-item">
                  <label>Rate Per</label>
                  <span className="capitalize">{product.ratePer || 'month'}</span>
                </div>
              </div>
            </div>

            {/* Repayment Configuration Section */}
            <div className="details-section">
              <h2>Repayment Configuration</h2>
              <div className="info-grid">
                <div className="info-item">
                  <label>Default Frequency</label>
                  <span className="capitalize">
                    {product.repayment?.defaultFrequency || product.defaultRepaymentFrequency || 'N/A'}
                  </span>
                </div>
                <div className="info-item">
                  <label>Allowed Frequencies</label>
                  <span>
                    {product.allowedRepaymentFrequencies?.join(', ') || 
                     product.repayment?.allowedFrequencies?.join(', ') || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Fees & Penalties Section */}
            <div className="details-section span-2">
              <h2>Fees & Penalties</h2>
              <div className="info-grid">
                <div className="info-item">
                  <label>Processing Fee</label>
                  <span className="fee-value">
                    {product.fees?.processing || product.processingFeeValue || 0}%
                  </span>
                </div>
                <div className="info-item">
                  <label>Penalty Rate (per day)</label>
                  <span className="fee-value">
                    {product.penaltyRate ? `${product.penaltyRate}% per day` : 'Not set'}
                  </span>
                </div>
                <div className="info-item">
                  <label>Late Fee</label>
                  <span className="fee-value">
                    {product.penalties?.late?.value || product.lateFee || 0}
                    {product.lateFee ? ` UGX` : '%'}
                  </span>
                </div>
                <div className="info-item">
                  <label>Default Fee</label>
                  <span className="fee-value">
                    {formatCurrency(0)}
                  </span>
                </div>
                <div className="info-item">
                  <label>Grace Period (Penalty)</label>
                  <span>{product.defaultGracePeriodDays || product.penalties?.graceDays || 0} days</span>
                </div>
              </div>
            </div>

            {/* Registration Fee Tiers Section */}
            {product.registrationFeeTiers && product.registrationFeeTiers.length > 0 && (
              <div className="details-section span-2">
                <h2>Registration Fee Tiers</h2>
                <div className="tiers-table">
                  <div className="tiers-header">
                    <span>Min Amount</span>
                    <span>Max Amount</span>
                    <span>Fee</span>
                  </div>
                  {product.registrationFeeTiers.map((tier, index) => (
                    <div key={index} className="tier-row">
                      <span className="amount-value">{formatCurrency(tier.minAmount)}</span>
                      <span className="amount-value">{formatCurrency(tier.maxAmount)}</span>
                      <span className="fee-value">{formatCurrency(tier.fee)}</span>
                    </div>
                  ))}
                </div>
                <div className="info-helper" style={{ marginTop: '12px', fontSize: '0.9em', color: '#666' }}>
                  <strong>Example:</strong> For a loan of {formatCurrency(150000)}, the registration fee would be {formatCurrency(
                    product.registrationFeeTiers.find(t => 150000 >= t.minAmount && 150000 <= t.maxAmount)?.fee || 0
                  )}
                </div>
              </div>
            )}

            {/* Duration Section */}
            <div className="details-section span-2">
              <h2>Duration Configuration</h2>
              <div className="info-grid">
                <div className="info-item">
                  <label>Minimum Duration</label>
                  <span>{product.minDuration || product.term?.minDays || 0} {product.durationUnit || 'days'}</span>
                </div>
                <div className="info-item">
                  <label>Maximum Duration</label>
                  <span>{product.maxDuration || product.term?.maxDays || 0} {product.durationUnit || 'days'}</span>
                </div>
                <div className="info-item">
                  <label>Default Duration</label>
                  <span>{product.defaultDuration || product.term?.defaultDays || 0} {product.durationUnit || 'days'}</span>
                </div>
              </div>
            </div>

            {/* Requirements Section */}
            {(product.requiresGuarantor !== undefined || product.requiresCollateral !== undefined) && (
              <div className="details-section span-2">
                <h2>Requirements</h2>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Guarantor Required</label>
                    <span className={product.requiresGuarantor ? 'text-success' : 'text-muted'}>
                      {product.requiresGuarantor ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Collateral Required</label>
                    <span className={product.requiresCollateral ? 'text-success' : 'text-muted'}>
                      {product.requiresCollateral ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Metadata Section */}
            <div className="details-section span-2">
              <h2>Metadata</h2>
              <div className="info-grid">
                <div className="info-item">
                  <label>Created At</label>
                  <span>{product.createdAt ? new Date(product.createdAt).toLocaleString() : 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>Last Updated</label>
                  <span>{product.updatedAt ? new Date(product.updatedAt).toLocaleString() : 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>Created By</label>
                  <span>{AuthService.getUserFullName()}</span>
                </div>
                <div className="info-item">
                  <label>Product Number</label>
                  <span className="product-code-badge">{product.code || product.productCode || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ViewLoanProduct;
