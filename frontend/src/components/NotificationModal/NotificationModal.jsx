import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import './NotificationModal.css';

const NotificationModal = ({ 
  isOpen, 
  type = 'success', 
  title,
  message, 
  onClose, 
  autoClose = 0,
  position = 'center'
}) => {
  // Auto close functionality
  useEffect(() => {
    if (isOpen && autoClose > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoClose);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Icon mapping based on type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={24} />;
      case 'error':
        return <XCircle size={24} />;
      case 'warning':
        return <AlertTriangle size={24} />;
      case 'info':
        return <Info size={24} />;
      default:
        return <CheckCircle size={24} />;
    }
  };

  // Title mapping based on type
  const getTitle = () => {
    if (title) return title;
    
    switch (type) {
      case 'success':
        return 'Success!';
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      case 'info':
        return 'Information';
      default:
        return 'Notification';
    }
  };

  return (
    <div className={`notification-modal-container ${position}`}>
      <div className={`notification-modal ${type}`}>
        <div className="notification-modal-header">
          <div className="notification-icon">
            {getIcon()}
          </div>
          <button className="notification-close-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        
        <div className="notification-modal-content">
          <h3>{getTitle()}</h3>
          <p>{message}</p>
        </div>
        
        <div className="notification-modal-footer">
          <button className={`notification-ok-button ${type}`} onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;