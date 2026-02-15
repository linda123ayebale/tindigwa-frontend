import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';

const ConnectionStatus = () => {
  const [status, setStatus] = useState({
    backend: 'checking',
    lastCheck: null,
    error: null
  });
  const [isVisible, setIsVisible] = useState(true);

  const checkBackendConnection = async () => {
    try {
      setStatus(prev => ({ ...prev, backend: 'checking', error: null }));
      
      // Try to hit a simple endpoint to check connectivity
      await ApiService.get('/auth/check-connection');
      
      setStatus({
        backend: 'connected',
        lastCheck: new Date().toLocaleTimeString(),
        error: null
      });
    } catch (error) {
      console.error('Backend connection failed:', error);
      setStatus({
        backend: 'disconnected',
        lastCheck: new Date().toLocaleTimeString(),
        error: error.message
      });
    }
  };

  useEffect(() => {
    checkBackendConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkBackendConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Auto-hide after 5 seconds regardless of status
  // useEffect(() => {
  //   if (status.backend === 'connected' || status.backend === 'disconnected') {
  //     const timer = setTimeout(() => {
  //       setIsVisible(false);
  //     }, 5000);
      
  //     return () => clearTimeout(timer);
  //   }
  // }, [status.backend]);

  if(status.backend === 'connected') return null; // Don't show anything while checking

  const getStatusColor = () => {
    switch (status.backend) {
      case 'connected': return '#28a745';
      case 'disconnected': return '#dc3545';
      case 'checking': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getStatusText = () => {
    switch (status.backend) {
      case 'connected': return '✅ Connected';
      case 'disconnected': return '❌ Not Connected';
      case 'checking': return '🔄 Checking Connection...';
      default: return '❓ Unknown Status';
    }
  };

  // Don't render if closed
  // if (!isVisible) {
  //   return null;
  // }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      backgroundColor: '#fff',
      border: `2px solid ${getStatusColor()}`,
      borderRadius: '8px',
      padding: '10px 15px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      fontSize: '14px',
      zIndex: 1000,
      minWidth: '250px'
    }}>
      {/* Header with status and buttons */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '5px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontWeight: 'bold', color: getStatusColor() }}>
            {getStatusText()}
          </span>
          <button
            onClick={checkBackendConnection}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '0'
            }}
            title="Refresh connection status"
          >
            
          </button>
        </div>
        
        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '0',
            lineHeight: '1',
            color: '#666'
          }}
          title="Close"
        >
          ×
        </button>
      </div>
      
      {status.lastCheck && (
        <div style={{ fontSize: '12px', color: '#666' }}>
          {status.lastCheck}
        </div>
      )}
      
      {status.error && (
        <div style={{ 
          fontSize: '12px', 
          color: '#dc3545', 
          marginTop: '5px',
          wordBreak: 'break-word'
        }}>
          {status.error}
        </div>
      )}
      
      {/* <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
        Backend: {process.env.REACT_APP_API_BASE_URL?.replace('/api', '') || 'http://localhost:8082'}
      </div> */}
    </div>
  );
};

export default ConnectionStatus;
