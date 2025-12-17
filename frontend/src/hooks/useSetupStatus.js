import { useState, useEffect } from 'react';
import ApiService from '../services/api';

const useSetupStatus = () => {
  const [setupStatus, setSetupStatus] = useState({
    isLoading: true,
    isSetupCompleted: false,
    hasAdminUsers: false,
    totalUsers: 0,
    error: null
  });

  const checkSetupStatus = async () => {
    try {
      setSetupStatus(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await ApiService.get('/auth/setup-status');
      
      setSetupStatus({
        isLoading: false,
        isSetupCompleted: response.setupCompleted,
        hasAdminUsers: response.hasAdminUsers,
        totalUsers: response.totalUsers,
        error: null
      });
    } catch (error) {
      console.error('Error checking setup status:', error);
      setSetupStatus(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
    }
  };

  useEffect(() => {
    checkSetupStatus();
  }, []);

  return {
    ...setupStatus,
    refetchSetupStatus: checkSetupStatus
  };
};

export default useSetupStatus;