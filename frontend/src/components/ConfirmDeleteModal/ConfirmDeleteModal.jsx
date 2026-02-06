import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import './ConfirmDeleteModal.css';

const ConfirmDeleteModal = ({
  isOpen,
  itemType = 'item',
  itemName,
  itemDetails = [],
  onConfirm,
  onCancel,
  onClose,
  isDeleting = false,
  customTitle,
  customMessage,
  customWarning,
  errorMessage = null
}) => {
  const handleClose = onClose || onCancel;
  if (!isOpen) return null;

  const defaultTitle = `Delete ${itemType.charAt(0).toUpperCase() + itemType.slice(1)} Confirmation`;
  const defaultMessage = `Are you sure you want to permanently delete this ${itemType.toLowerCase()}?`;
  const defaultWarning = 'THIS ACTION CANNOT BE UNDONE!';

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div className="confirm-delete-overlay" onClick={handleOverlayClick}>
      <div className="confirm-delete-modal">
        {/* Close Button */}
        <button 
          className="modal-close-btn"
          onClick={handleClose}
          disabled={isDeleting}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="modal-header">
          <div className="modal-icon">
            <AlertTriangle size={32} />
          </div>
          <h2 className="modal-title">
            {customTitle || defaultTitle}
          </h2>
        </div>

        {/* Content */}
        <div className="modal-content">
          <p className="modal-message">
            {customMessage || defaultMessage}
          </p>

          {/* Item Details */}
          {itemName && (
            <div className="item-details">
              <div className="item-name">
                <strong>{itemName}</strong>
              </div>
              {itemDetails.length > 0 && (
                <div className="item-info">
                  {itemDetails.map((detail, index) => (
                    <div key={index} className="detail-item">
                      • {detail}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Warning */}
          {!errorMessage && (
            <div className="warning-section">
              <div className="warning-icon">
                <AlertTriangle size={16} />
              </div>
              <span className="warning-text">
                {customWarning || defaultWarning}
              </span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="error-section">
              <div className="error-icon">
                <X size={16} />
              </div>
              <span className="error-text">
                {errorMessage}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          {errorMessage ? (
            <button
              type="button"
              className="btn btn-cancel"
              onClick={handleClose}
              style={{ width: '100%' }}
            >
              Close
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-cancel"
                onClick={handleClose}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-delete"
                onClick={onConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="btn-spinner"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;