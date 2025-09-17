import React from 'react';

const Layout = ({ children }) => {
  return (
    <div style={{ padding: '20px', minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h1 style={{ color: '#333', marginBottom: '20px' }}>TINDIGWA Dashboard</h1>
        {children}
      </div>
    </div>
  );
};

export default Layout;
