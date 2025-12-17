import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/authService';
import { validateEmail } from '../../utils/validation';
import './Login.css';

const Login = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldKey, setFieldKey] = useState(Date.now()); // Random key to force re-render
  
  const navigate = useNavigate();

  // Clear form data when component mounts to prevent session persistence
  useEffect(() => {
    // Clear authentication state on mount
    localStorage.removeItem('tindigwa_token');
    localStorage.removeItem('tindigwa_user');
    setFormData({
      email: '',
      password: ''
    });
    setError('');
    setFieldKey(Date.now());
  }, []);

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

    try {
      // Validate email format
      const emailValidation = validateEmail(formData.email, true);
      if (!emailValidation.isValid) {
        setError(emailValidation.error);
        setLoading(false);
        return;
      }
      
      if (formData.email && formData.password) {
        // Use real authentication service
        const response = await AuthService.login(formData.email, formData.password);
        
        console.log('Login successful:', response);
        
        // Clear form data after successful login
        clearForm();
        
        // Set authentication state
        setIsAuthenticated(true);
        
        // Small delay to ensure token is properly stored before navigation
        setTimeout(() => {
          navigate('/dashboard');
        }, 100);
      } else {
        setError('Please enter both email and password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setFormData({
      email: '',
      password: ''
    });
    setError('');
  };

  const handleSignUp = () => {
    clearForm();
    navigate('/setup');
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password page
    navigate('/forgot-password');
  };

  const handleClearBrowserData = () => {
    // Clear all browser stored data
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear form data
    setFormData({ email: '', password: '' });
    setFieldKey(Date.now());
    
    // Force form reset
    const form = document.querySelector('.login-form');
    if (form) {
      form.reset();
    }
    
    alert('Browser data cleared! Please refresh the page if autofill persists.');
    
    // Force page reload as last resort
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-form-container">
          <div className="welcome-section">
            <h1>Welcome back</h1>
          </div>

          <form onSubmit={handleSubmit} className="login-form" autoComplete="off">
            {/* Hidden dummy fields to confuse browser autofill */}
            <div style={{ display: 'none' }}>
              <input type="text" name="fake_email" autoComplete="off" />
              <input type="password" name="fake_password" autoComplete="off" />
            </div>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor={`email-${fieldKey}`}>Email</label>
              <input
                key={`email-${fieldKey}`}
                type="text"
                id={`email-${fieldKey}`}
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="form-input"
                autoComplete="nope"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                data-form-type="other"
                data-lpignore="true"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor={`password-${fieldKey}`}>Password</label>
              <input
                key={`password-${fieldKey}`}
                type="password"
                id={`password-${fieldKey}`}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="form-input"
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                data-form-type="other"
                data-lpignore="true"
                required
              />
            </div>

           <div className="forgot-password">
              <div className="form-links">
                <button 
                  type="button" 
                  className="forgot-link" 
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </button>
                <button 
                  type="button" 
                  className="clear-form-link" 
                  onClick={handleClearBrowserData}
                >
                  Clear Form Data
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              <span className="button-icon">🔐</span>
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div className="signup-section">
              <span className="signup-text">Don't have an account? </span>
              <button 
                type="button" 
                className="signup-link" 
                onClick={handleSignUp}
              >
                Sign up
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
