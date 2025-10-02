import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import AddClientForm from '../../components/AddClientForm';
import './AddClient.css';

const AddClient = () => {
  const navigate = useNavigate();

  const handleAddClient = async (clientData) => {
    try {
      // Here you would make an API call to save the client
      console.log('Adding client:', clientData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      alert('Client added successfully!');
      
      // Navigate back to clients list
      navigate('/clients');
      
    } catch (error) {
      console.error('Error adding client:', error);
      alert('Failed to add client. Please try again.');
      throw error;
    }
  };

  const handleCancel = () => {
    navigate('/clients');
  };

  return (
    <div className="add-client-page-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>TINDIGWA</h2>
        </div>
        
        <nav className="sidebar-nav">
          <button className="nav-item" onClick={() => navigate('/dashboard')}>
            <span>Dashboard</span>
          </button>
          <button className="nav-item active" onClick={() => navigate('/clients')}>
            <span>Clients</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/loans')}>
            <span>Loans</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/payments')}>
            <span>Payments</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/settings')}>
            <span>Settings</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="page-header">
          <div className="header-left">
            <button 
              className="back-button"
              onClick={() => navigate('/clients')}
            >
              <ArrowLeft size={20} />
              Back to Clients
            </button>
            <h1>Add New Client</h1>
          </div>
        </div>

        <div className="content-container">
          {/* Render the form component WITHOUT modal wrapper */}
          <AddClientForm
            onSubmit={handleAddClient}
            onCancel={handleCancel}
            isPageMode={true} // Signal that this is page mode, not modal
          />
        </div>
      </main>
    </div>
  );
};

export default AddClient;
