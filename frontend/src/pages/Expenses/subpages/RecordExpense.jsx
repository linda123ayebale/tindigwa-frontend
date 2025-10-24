import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../../services/api';
import { 
  Plus,
  Calendar,
  User,
  Save,
  ArrowLeft,
  Receipt
} from 'lucide-react';
import Sidebar from '../../../components/Layout/Sidebar';
import '../../../pages/Finances/Expenses.css';

const RecordExpense = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    newCategory: ''
  });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await ApiService.get('/expense-categories/names'); 
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        alert('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.amount || isNaN(formData.amount)) {
      newErrors.amount = 'Valid amount is required';
    }
    if (!formData.description) {
      newErrors.description = 'Description is required';
    }
    if (!formData.category && !formData.newCategory) {
      newErrors.category = 'Please select or create a category';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateCategory = async () => {
    try {
      const response = await ApiService.post('/expense-categories', {
        categoryName: formData.newCategory,
        colorCode: '#3498db'
      });
      setCategories(prev => [...prev, response.data.categoryName]);
      setFormData(prev => ({ 
        ...prev, 
        category: response.data.categoryName,
        newCategory: ''
      }));
      setShowCategoryModal(false);
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Failed to create category: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = {
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: formData.date,
        category: formData.category,
        type: 'Operational Expense' // Default type, can be customized
      };

      // Adjust this endpoint based on your actual operational expenses endpoint
      await ApiService.post('/operational-expenses', payload);
      navigate('/expenses/all');
    } catch (error) {
      console.error('Error creating expense:', error);
      alert('Failed to create expense: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <div className="page-header">
          <div className="header-content">
            <button 
              className="back-button"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={20} />
            </button>
            <h1>Record New Expense</h1>
            <p className="page-description">Track operational costs and expenses</p>
          </div>
        </div>

        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <div className="form-group">
                <label>Amount (UGX)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  className={errors.amount ? 'error' : ''}
                />
                {errors.amount && <span className="error-message">{errors.amount}</span>}
              </div>

              <div className="form-group">
                <label>Date</label>
                <div className="date-input-container">
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                  <Calendar size={18} className="date-icon" />
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className={errors.description ? 'error' : ''}
                  rows={3}
                />
                {errors.description && <span className="error-message">{errors.description}</span>}
              </div>
            </div>

            <div className="form-section">
              <div className="form-group">
                <label>Expense Category</label>
                <div className="category-selector">
                  <select
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className={errors.category ? 'error' : ''}
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <button 
                    type="button"
                    className="add-category-btn"
                    onClick={() => setShowCategoryModal(true)}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                {errors.category && <span className="error-message">{errors.category}</span>}
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button"
                className="cancel-btn"
                onClick={() => navigate('/expenses/all')}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="save-btn"
              >
                <Save size={16} />
                Record Expense
              </button>
            </div>
          </form>
        </div>

        {/* Category Creation Modal */}
        {showCategoryModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2><Receipt size={20} /> Create New Category</h2>
              <div className="modal-form">
                <div className="form-group">
                  <label>Category Name</label>
                  <input 
                    type="text" 
                    value={formData.newCategory}
                    onChange={e => setFormData({...formData, newCategory: e.target.value})}
                  />
                </div>
                <div className="modal-actions">
                  <button 
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowCategoryModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    className="confirm-btn"
                    onClick={handleCreateCategory}
                  >
                    Create Category
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RecordExpense;
