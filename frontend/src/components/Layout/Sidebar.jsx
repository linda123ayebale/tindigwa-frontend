import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  CreditCard, 
  DollarSign, 
  FileText, 
  Receipt, 
  Settings,
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = React.useState({});

  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const menuItems = [
    {
      key: 'dashboard',
      title: 'Dashboard',
      icon: Home,
      path: '/dashboard'
    },
    {
      key: 'clients',
      title: 'Client Management',
      icon: Users,
      children: [
        { title: 'All Clients', path: '/clients' },
        { title: 'Add Client', path: '/clients/add' }
      ]
    },
    {
      key: 'loans',
      title: 'Loan Management',
      icon: CreditCard,
      children: [
        { title: 'All Loans', path: '/loans' },
        { title: 'Loan Application', path: '/loans/application' },
        { title: 'Loan Disbursement', path: '/loans/disbursement' }
      ]
    },
    {
      key: 'payments',
      title: 'Payment Management',
      icon: DollarSign,
      children: [
        { title: 'Payment Overview', path: '/payments' },
        { title: 'Outstanding Loans', path: '/payments/outstanding' }
      ]
    },
    {
      key: 'reports',
      title: 'Reports',
      icon: FileText,
      children: [
        { title: 'Daily Reports', path: '/reports/daily' },
        { title: 'Monthly Reports', path: '/reports/monthly' },
        { title: 'Loan Reports', path: '/reports/loans' }
      ]
    },
    {
      key: 'expenses',
      title: 'Expenses',
      icon: Receipt,
      children: [
        { title: 'View Expenses', path: '/expenses' },
        { title: 'Add Expense', path: '/expenses/add' }
      ]
    },
    {
      key: 'settings',
      title: 'Settings',
      icon: Settings,
      children: [
        { title: 'General Settings', path: '/settings' },
        { title: 'Staff Management', path: '/settings/staff' }
      ]
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth <= 768) {
      toggleSidebar();
    }
  };

  const isActive = (path) => location.pathname === path;
  const isParentActive = (children) => children?.some(child => isActive(child.path));

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Navigation</h2>
          <button className="close-button" onClick={toggleSidebar}>
            <X size={20} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedMenus[item.key];
            const itemIsActive = item.path ? isActive(item.path) : isParentActive(item.children);

            return (
              <div key={item.key} className="nav-item">
                <button
                  className={`nav-button ${itemIsActive ? 'active' : ''}`}
                  onClick={() => {
                    if (hasChildren) {
                      toggleMenu(item.key);
                    } else {
                      handleNavigation(item.path);
                    }
                  }}
                >
                  <Icon size={20} />
                  <span>{item.title}</span>
                  {hasChildren && (
                    isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                  )}
                </button>
                
                {hasChildren && isExpanded && (
                  <div className="nav-submenu">
                    {item.children.map((child, index) => (
                      <button
                        key={index}
                        className={`nav-subbutton ${isActive(child.path) ? 'active' : ''}`}
                        onClick={() => handleNavigation(child.path)}
                      >
                        {child.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
