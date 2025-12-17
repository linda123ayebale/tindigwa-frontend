import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';

const ConnectionStatus = () => {
  const [status, setStatus] = useState({
    backend: 'checking',
    lastCheck: null,
    error: null
  });

  const checkBackendConnection = async () => {
    try {
      setStatus(prev => ({ ...prev, backend: 'checking', error: null }));
      
      // Try to hit a simple endpoint to check connectivity
      await ApiService.get('/clients');
      
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
      case 'connected': return '✅ Backend Connected';
      case 'disconnected': return '❌ Backend Disconnected';
      case 'checking': return '🔄 Checking Connection...';
      default: return '❓ Unknown Status';
    }
  };

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
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px',
        marginBottom: '5px'
      }}>
        <span style={{ fontWeight: 'bold', color: getStatusColor() }}>
          {getStatusText()}
        </span>
        <button
          onClick={checkBackendConnection}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px'
          }}
          title="Refresh connection status"
        >
          🔄
        </button>
      </div>
      
      {status.lastCheck && (
        <div style={{ fontSize: '12px', color: '#666' }}>
          Last checked: {status.lastCheck}
        </div>
      )}
      
      {status.error && (
        <div style={{ 
          fontSize: '12px', 
          color: '#dc3545', 
          marginTop: '5px',
          wordBreak: 'break-word'
        }}>
          Error: {status.error}
        </div>
      )}
      
      <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
        Backend: http://localhost:8081
      </div>
    </div>
  );
};

export default ConnectionStatus;
