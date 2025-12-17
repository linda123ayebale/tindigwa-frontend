import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import './ExpandableMenuItem.css';

const ExpandableMenuItem = ({ item, icon: Icon }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(
    item.children?.some(child => location.pathname.startsWith(child.path))
  );

  const isActive = () => {
    if (item.path) {
      return location.pathname === item.path;
    }
    return item.children?.some(child => location.pathname === child.path);
  };

  const handleParentClick = () => {
    if (item.children && item.children.length > 0) {
      setIsExpanded(!isExpanded);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const handleChildClick = (childPath) => {
    navigate(childPath);
  };

  return (
    <div className="expandable-menu-item">
      <button
        className={`nav-item parent ${isActive() ? 'active' : ''}`}
        onClick={handleParentClick}
      >
        <div className="nav-item-content">
          <Icon size={20} />
          <span>{item.title}</span>
        </div>
        {item.children && item.children.length > 0 && (
          <div className="expand-icon">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
        )}
      </button>

      {item.children && item.children.length > 0 && isExpanded && (
        <div className="submenu">
          {item.children.map((child, index) => {
            const ChildIcon = child.icon;
            return (
              <button
                key={index}
                className={`nav-item child ${location.pathname === child.path ? 'active' : ''}`}
                onClick={() => handleChildClick(child.path)}
              >
                <ChildIcon size={18} />
                <span>{child.title}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExpandableMenuItem;
