import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import websocketService from '../services/websocketService';
import AuthService from '../services/authService';
import './LogOut.css';

function LogoutButton({ setIsAuthenticated }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate(); // Moved inside the component

  const handleLogout = () => {
    setIsLoggingOut(true); // Show loader

    try {
      // Disconnect WebSocket
      websocketService.unsubscribeAll();
      websocketService.disconnect();

      // Clear auth data
      AuthService.logout();

      // Update auth state
      if (setIsAuthenticated) {
        setIsAuthenticated(false);
      }

      // Navigate to login
      navigate('/login', { replace: true }); // Correct usage
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoggingOut(false); // Hide loader
    }
  };

  return (
    <div>
      {isLoggingOut && (
        <div className="loader-overlay">
          <div className="spinner">Logging out...</div>
        </div>
      )}
      <button onClick={handleLogout} disabled={isLoggingOut}>
        Logout
      </button>
    </div>
  );
}

export default LogoutButton;