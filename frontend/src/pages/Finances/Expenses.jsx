import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import Sidebar from '../../components/Layout/Sidebar';
import './Expenses.css';

const Expenses = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');


  // Sample expenses data
  useEffect(() => {
    const sampleExpenses = [
      {
        id: 'EXP001',
        expenseType: 'Operational Expenses',
        amount: 75000,
        date: '2024-08-15',
        description: 'Office rent for August 2024',
        createdBy: 'Admin User',
        category: 'operational',
        createdAt: '2024-08-15T09:00:00Z'
      },
      {
        id: 'EXP002',
        expenseType: 'Salaries & Benefits',
        amount: 150000,
        date: '2024-08-01',
        description: 'Monthly salary payments for staff',
        createdBy: 'HR Manager',
        category: 'salaries',
        createdAt: '2024-08-01T10:30:00Z'
      },
      {
        id: 'EXP003',
        expenseType: 'Marketing & Advertising',
        amount: 25000,
        date: '2024-08-10',
        description: 'Social media advertising campaign',
        createdBy: 'Marketing Team',
        category: 'marketing',
        createdAt: '2024-08-10T14:15:00Z'
      },
      {
        id: 'EXP004',
        expenseType: 'Office Supplies',
        amount: 35000,
        date: '2024-08-20',
        description: 'Stationery and office equipment',
        createdBy: 'Office Manager',
        category: 'operational',
        createdAt: '2024-08-20T11:45:00Z'
      },
      {
        id: 'EXP005',
        expenseType: 'Utilities',
        amount: 45000,
        date: '2024-08-25',
        description: 'Electricity and water bills',
        createdBy: 'Admin User',
        category: 'operational',
        createdAt: '2024-08-25T16:20:00Z'
      }
    ];
    setExpenses(sampleExpenses);
  }, []);

  const handleDeleteExpense = (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
      setExpenses(prevExpenses => prevExpenses.filter(expense => expense.id !== expenseId));
    }
  };

  // Filter expenses based on search term and type
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = 
      expense.expenseType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || expense.category === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      operational: { bg: '#e6f3ff', text: '#3182ce' },
      salaries: { bg: '#e6f7ed', text: '#38a169' },
      marketing: { bg: '#fff3e0', text: '#ed8936' }
    };
    return colors[category] || { bg: '#f7fafc', text: '#4a5568' };
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="page-header">
          <div className="header-content">
            <h1>Expenses</h1>
            <p className="page-description">Manage operational expenses and costs</p>
          </div>
          <button 
            className="add-expense-btn"
            onClick={() => navigate('/expenses/add')}
          >
            <Plus size={16} />
            Add New Expense
          </button>
        </div>

        <div className="expenses-content">
          {/* Filters and Search */}
          <div className="expenses-controls">
            <div className="search-box">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Search expenses by type, description, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-controls">
              <div className="filter-group">
                <Filter size={16} />
                <select 
                  value={typeFilter} 
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="operational">Operational</option>
                  <option value="salaries">Salaries</option>
                  <option value="marketing">Marketing</option>
                </select>
              </div>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="expenses-table-container">
            {filteredExpenses.length === 0 ? (
              <div className="empty-state">
                <Receipt size={48} />
                <h3>No expenses found</h3>
                <p>
                  {searchTerm || typeFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Get started by adding your first expense.'
                  }
                </p>
                {!searchTerm && typeFilter === 'all' && (
                  <button 
                    className="add-expense-btn primary"
                    onClick={() => navigate('/expenses/add')}
                  >
                    <Plus size={16} />
                    Add Your First Expense
                  </button>
                )}
              </div>
            ) : (
              <div className="expenses-table">
                <div className="table-header">
                  <div className="table-row header-row">
                    <div className="table-cell">Expense</div>
                    <div className="table-cell">Type</div>
                    <div className="table-cell">Amount</div>
                    <div className="table-cell">Date</div>
                    <div className="table-cell">Created By</div>
                    <div className="table-cell">Actions</div>
                  </div>
                </div>
                
                <div className="table-body">
                  {filteredExpenses.map((expense) => {
                    const categoryColor = getCategoryColor(expense.category);
                    
                    return (
                      <div key={expense.id} className="table-row">
                        <div className="table-cell">
                          <div className="expense-info">
                            <div 
                              className="expense-avatar"
                              style={{ 
                                backgroundColor: categoryColor.bg,
                                color: categoryColor.text
                              }}
                            >
                              <Receipt size={16} />
                            </div>
                            <div className="expense-details">
                              <div className="expense-id">{expense.id}</div>
                              <div className="expense-description">
                                {expense.description}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="table-cell">
                          <span 
                            className="expense-type-badge"
                            style={{
                              backgroundColor: categoryColor.bg,
                              color: categoryColor.text
                            }}
                          >
                            {expense.expenseType}
                          </span>
                        </div>
                        
                        <div className="table-cell">
                          <div className="amount-display">
                            {formatCurrency(expense.amount)}
                          </div>
                        </div>
                        
                        <div className="table-cell">
                          <div className="date-info">
                            <Calendar size={12} />
                            {formatDate(expense.date)}
                          </div>
                        </div>
                        
                        <div className="table-cell">
                          <div className="creator-info">
                            <User size={12} />
                            {expense.createdBy}
                          </div>
                        </div>
                        
                        <div className="table-cell">
                          <div className="action-buttons">
                            <button 
                              className="action-btn view"
                              title="View Details"
                            >
                              <Eye size={14} />
                            </button>
                            <button 
                              className="action-btn edit"
                              title="Edit Expense"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              className="action-btn delete"
                              title="Delete Expense"
                              onClick={() => handleDeleteExpense(expense.id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Summary Statistics */}
          <div className="expenses-summary">
            <div className="summary-stats">
              <div className="stat-card">
                <h3>Total Expenses</h3>
                <div className="stat-value">{filteredExpenses.length}</div>
                <div className="stat-change">Entries</div>
              </div>
              <div className="stat-card">
                <h3>Total Amount</h3>
                <div className="stat-value">
                  {formatCurrency(filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0))}
                </div>
                <div className="stat-change">This period</div>
              </div>
              <div className="stat-card">
                <h3>Operational</h3>
                <div className="stat-value">
                  {formatCurrency(
                    filteredExpenses
                      .filter(exp => exp.category === 'operational')
                      .reduce((sum, expense) => sum + expense.amount, 0)
                  )}
                </div>
                <div className="stat-change">Operations</div>
              </div>
              <div className="stat-card">
                <h3>Salaries</h3>
                <div className="stat-value">
                  {formatCurrency(
                    filteredExpenses
                      .filter(exp => exp.category === 'salaries')
                      .reduce((sum, expense) => sum + expense.amount, 0)
                  )}
                </div>
                <div className="stat-change">Staff costs</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Expenses;
