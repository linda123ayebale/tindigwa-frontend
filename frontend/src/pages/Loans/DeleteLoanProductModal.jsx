import React from 'react';
import { AlertCircle } from 'lucide-react';
import './DeleteLoanProductModal.css';

const DeleteLoanProductModal = ({ product, onConfirm, onCancel }) => {
  if (!product) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <AlertCircle size={20} />
            Delete Loan Product
          </h3>
        </div>
        
        <div className="modal-body">
          <p>Are you sure you want to delete this loan product?</p>
          <div className="product-info">
            <strong>{product.productName}</strong>
            <span className="product-code-badge">{product.productCode}</span>
          </div>
          <p className="warning-text">
            This action cannot be undone. All configurations and settings for this product will be permanently removed.
          </p>
        </div>
        
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn-danger" onClick={onConfirm}>
            Delete Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteLoanProductModal;
