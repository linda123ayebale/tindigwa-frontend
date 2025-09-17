import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, User, LogOut, Settings } from 'lucide-react';
import './Header.css';

const Header = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const handleLogout = () => {
    localStorage.removeItem('tindigwa_token');
    navigate('/login');
  };

  const currentUser = JSON.parse(localStorage.getItem('tindigwa_user') || '{}');

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-button" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <div className="logo">
          <h1>TINDIGWA</h1>
          <span>Loan Management System</span>
        </div>
      </div>
      
      <div className="header-center">
        <div className="search-container">
          <input 
            type="search" 
            placeholder="Search clients, loans..." 
            className="search-input"
          />
        </div>
      </div>

      <div className="header-right">
        <button className="notification-button">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>

        <div className="user-menu">
          <button 
            className="user-button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <User size={20} />
            <span>{currentUser.name || 'User'}</span>
          </button>
          
          {dropdownOpen && (
            <div className="user-dropdown">
              <button onClick={() => navigate('/settings')}>
                <Settings size={16} />
                Settings
              </button>
              <button onClick={handleLogout}>
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
