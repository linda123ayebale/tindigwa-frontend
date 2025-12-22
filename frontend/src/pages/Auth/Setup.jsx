import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { validateEmail } from '../../utils/validation';
import './Setup.css';

const Setup = ({ onSetupComplete }) => {
  const [formData, setFormData] = useState({
    adminName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!formData.adminName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    // Email validation
    const emailValidation = validateEmail(formData.email, true);
    if (!emailValidation.isValid) {
      setError(emailValidation.error);
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      console.log('🚀 Submitting setup data:', {
        adminName: formData.adminName,
        email: formData.email,
        password: '[HIDDEN]'
      });

      // Call the actual backend setup API
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081/api';
      const response = await fetch(`${apiBaseUrl}/auth/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminName: formData.adminName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        })
      });

      console.log('📥 Response status:', response.status);
      
      const result = await response.json();
      console.log('📊 Response data:', result);

      if (response.ok) {
        // Success! Store the token and user info
        if (result.token) {
          localStorage.setItem('authToken', result.token);
        }
        
        if (result.user) {
          localStorage.setItem('currentUser', JSON.stringify(result.user));
        }
        
        // Mark setup as complete
        localStorage.setItem('tindigwa_setup_complete', 'true');
        
        console.log('✅ Setup successful!', result.message);
        
        // Show success message if it's first admin
        if (result.user && result.user.role === 'ADMIN') {
          console.log('🎉 First admin user created!');
        }
        
        // Call the callback to refresh setup status
        if (onSetupComplete) {
          onSetupComplete();
        }
        
        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        // Handle error response
        const errorMessage = result.error || result.message || 'Setup failed';
        console.error('❌ Setup failed:', errorMessage);
        setError(errorMessage);
      }
    } catch (err) {
      console.error('🚨 Network error:', err);
      
      if (err.message.includes('fetch')) {
        const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081/api';
        setError(`Cannot connect to backend server. Please ensure the backend is running on ${apiBaseUrl}`);
      } else {
        setError('Setup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-container">
      <div className="setup-content">
        <div className="setup-header">
          <div className="logo">
            <span className="logo-icon">💰</span>
            <span className="logo-text">CashtankFinance</span>
          </div>
        </div>

        <div className="setup-form-container">
          <div className="welcome-section">
            <h1>Create Your Account</h1>
            <p>Join CashtankFinance and start managing loans efficiently.</p>
          </div>

          <form onSubmit={handleSubmit} className="setup-form">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="adminName">Full Name</label>
              <input
                type="text"
                id="adminName"
                name="adminName"
                value={formData.adminName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="complete-setup-button"
              disabled={loading}
            >
              <span className="button-icon">🔧</span>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="login-link">
              <span className="login-text">Already have an account? </span>
              <button 
                type="button" 
                className="login-link-button" 
                onClick={() => navigate('/login')}
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Setup;
