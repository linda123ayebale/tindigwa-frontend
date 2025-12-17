import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  CreditCard, 
  DollarSign, 
  FileText, 
  Receipt, 
  Settings,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Plus,
  List,
  UserPlus,
  Eye,
  Clock,
  AlertCircle,
  History,
  TrendingUp,
  CheckCircle,
  XCircle,
  Package,
  Target,
  Archive
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const sidebarItems = [
    { 
      key: 'dashboard',
      title: 'Dashboard', 
      icon: Home, 
      path: '/dashboard' 
    },
    { 
      key: 'users',
      title: 'Users', 
      icon: Users,
      children: [
        { title: 'Add Client', icon: UserPlus, path: '/clients/add' },
        { title: 'View Clients', icon: Eye, path: '/clients' },
        { title: 'View Staff', icon: Users, path: '/users/staff' },
        { title: 'Add Staff', icon: UserPlus, path: '/users/add-staff' }
      ]
    },
    { 
      key: 'loans',
      title: 'Loans', 
      icon: CreditCard,
      children: [
        { title: 'View All Loans', icon: List, path: '/loans' },
        { title: 'Add Loan', icon: Plus, path: '/loans/add' },
        { title: 'Loan Products', icon: Package, path: '/loans/products' },
        { title: 'Pending Approvals', icon: Clock, path: '/loans/pending' },
        { title: 'Rejected Loans', icon: XCircle, path: '/loans/rejected' },
        { title: 'Archived Loans', icon: Archive, path: '/loans/archived' },
        { title: 'Loan Tracking', icon: Target, path: '/loans/tracking' }
      ]
    },
    { 
      key: 'payments',
      title: 'Payments', 
      icon: DollarSign,
      children: [
        { title: 'Record Payment', icon: Plus, path: '/payments/record' },
        { title: 'All Payments', icon: List, path: '/payments/all' },
        { title: 'Late Payments', icon: AlertCircle, path: '/payments/late' },
        { title: 'Upcoming Due', icon: Clock, path: '/payments/upcoming' },
        { title: 'Payment History', icon: History, path: '/payments/history' },
        { title: 'Analytics', icon: TrendingUp, path: '/payments/analytics' }
      ]
    },
    { 
      key: 'expenses',
      title: 'Expenses', 
      icon: Receipt,
      children: [
        { title: 'Add Category', icon: Plus, path: '/expenses/categories' },
        { title: 'Record Expense', icon: Plus, path: '/expenses/add' },
        { title: 'All Expenses', icon: List, path: '/expenses' },
        { title: 'Pending Approvals', icon: Clock, path: '/expenses/pending-approvals' },
        { title: 'Rejected Expenses', icon: XCircle, path: '/expenses/rejected' },
        { title: 'Expenses to Pay', icon: DollarSign, path: '/expenses/to-pay' }
      ]
    },
    { 
  key: 'branches',
  title: 'Branches', 
  icon: Users,
  path: '/branches'
},


    { 
      key: 'finances',
      title: 'Finances', 
      icon: BarChart3, 
      path: '/finances' 
    },

    { 
      key: 'reports',
      title: 'Reports', 
      icon: FileText, 
      path: '/reports' 
    },
    { 
      key: 'settings',
      title: 'Settings', 
      icon: Settings, 
      path: '/settings' 
    }
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isParentActive = (children) => {
    return children?.some(child => isActive(child.path));
  };

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-header">
        <h2>TINDIGWA</h2>
      </div>
      
      <nav className="sidebar-nav">
        {sidebarItems.map((item) => {
          const IconComponent = item.icon;
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedMenus[item.key];
          const itemIsActive = item.path ? isActive(item.path) : isParentActive(item.children);

          return (
            <div key={item.key} className="nav-item-wrapper">
              <button
                className={`nav-item ${itemIsActive ? 'active' : ''}`}
                onClick={() => {
                  if (hasChildren) {
                    toggleMenu(item.key);
                  } else if (item.path) {
                    navigate(item.path);
                  }
                }}
              >
                <IconComponent size={20} />
                <span>{item.title}</span>
                {hasChildren && (
                  isExpanded ? <ChevronDown size={16} className="chevron" /> : <ChevronRight size={16} className="chevron" />
                )}
              </button>
              
              {hasChildren && isExpanded && (
                <div className="nav-submenu">
                  {item.children.map((child, index) => {
                    const ChildIcon = child.icon;
                    return (
                      <button
                        key={index}
                        className={`nav-subitem ${isActive(child.path) ? 'active' : ''}`}
                        onClick={() => navigate(child.path)}
                      >
                        {ChildIcon && <ChildIcon size={16} />}
                        <span>{child.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
