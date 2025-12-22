import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronDown,
  Calendar,
  Save,
  X
} from 'lucide-react';
import Sidebar from '../../components/Layout/Sidebar';
import './AddExpense.css';

const AddExpense = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    expenseType: '',
    amount: '',
    date: '',
    description: ''
  });


  const expenseTypes = [
    'Operational Expenses',
    'Salaries & Benefits',
    'Marketing & Advertising', 
    'Office Supplies',
    'Utilities',
    'Transportation',
    'Professional Services',
    'Technology & Software',
    'Training & Development',
    'Insurance',
    'Maintenance & Repairs',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.expenseType || !formData.amount || !formData.date) {
      alert('Please fill in all required fields');
      return;
    }

    if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    // Simulate saving expense
    const expenseData = {
      id: Date.now(),
      ...formData,
      amount: parseFloat(formData.amount),
      createdAt: new Date().toISOString()
    };

    console.log('Saving expense:', expenseData);
    
    // In a real app, you would make an API call here
    alert('Expense saved successfully!');
    
  // Navigate back to expenses list or financial dashboard
  navigate('/expenses/all');
  };

  const handleCancel = () => {
    navigate('/finances');
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="page-header">
          <div className="header-content">
            <h1>Operational Expenses</h1>
            <p className="page-description">Add a new expense entry</p>
          </div>
          <button 
            className="cancel-btn"
            onClick={handleCancel}
          >
            <X size={16} />
            Cancel
          </button>
        </div>

        <div className="add-expense-content">
          <div className="expense-form-container">
            <form onSubmit={handleSubmit} className="expense-form">
              {/* Expense Type */}
              <div className="form-group">
                <label htmlFor="expenseType">Expense Type</label>
                <div className="select-wrapper">
                  <select
                    id="expenseType"
                    name="expenseType"
                    value={formData.expenseType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Expense Type</option>
                    {expenseTypes.map((type, index) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="select-icon" />
                </div>
              </div>

              {/* Amount */}
              <div className="form-group">
                <label htmlFor="amount">Amount (UGX)</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  placeholder="Enter Amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  min="0"
                  step="1000"
                  required
                />
              </div>

              {/* Expense Date */}
              <div className="form-group">
                <label htmlFor="date">Expense Date</label>
                <div className="date-input-wrapper">
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                  <Calendar size={16} className="date-icon" />
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Enter Description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                />
              </div>

              {/* Submit Button */}
              <div className="form-actions">
                <button type="submit" className="save-expense-btn">
                  <Save size={16} />
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddExpense;
