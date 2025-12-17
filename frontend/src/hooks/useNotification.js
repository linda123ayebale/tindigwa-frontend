import { useState, useCallback } from 'react';

export const useNotification = () => {
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
    autoClose: 0,
    position: 'center'
  });

  const showNotification = useCallback(({
    type = 'success',
    title = '',
    message = '',
    autoClose = 0,
    position = 'center'
  }) => {
    setNotification({
      isOpen: true,
      type,
      title,
      message,
      autoClose,
      position
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Convenience methods for different types
  const showSuccess = useCallback((message, options = {}) => {
    showNotification({
      type: 'success',
      message,
      ...options
    });
  }, [showNotification]);

  const showError = useCallback((message, options = {}) => {
    showNotification({
      type: 'error',
      message,
      ...options
    });
  }, [showNotification]);

  const showWarning = useCallback((message, options = {}) => {
    showNotification({
      type: 'warning',
      message,
      ...options
    });
  }, [showNotification]);

  const showInfo = useCallback((message, options = {}) => {
    showNotification({
      type: 'info',
      message,
      ...options
    });
  }, [showNotification]);

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};