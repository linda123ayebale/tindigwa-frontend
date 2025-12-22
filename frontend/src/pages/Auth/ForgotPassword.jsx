import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../services/api';
import { validateEmail } from '../../utils/validation';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Email validation
    const emailValidation = validateEmail(email, true);
    if (!emailValidation.isValid) {
      setError(emailValidation.error);
      setLoading(false);
      return;
    }

    try {
      // Call real API endpoint for password reset
      const response = await ApiService.post('/auth/forgot-password', { email });
      
      if (response && response.message) {
        console.log('Password reset email sent successfully');
      }
      
      setSuccess(true);
      setLoading(false);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to send reset email. Please try again.');
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  if (success) {
    return (
      <div className="forgot-password-container">
        <div className="forgot-password-content">
          <div className="forgot-password-form-container">
            <div className="success-section">
              <div className="success-icon">✉️</div>
              <h1>Check your email</h1>
              <p>
                We've sent a password reset code to <strong>{email}</strong>
              </p>
              <p className="success-subtitle">
                Enter the 6-digit code from your email to reset your password.
              </p>
              
              <button 
                className="back-to-login-button"
                onClick={() => navigate('/reset-password', { state: { email } })}
              >
                Enter Reset Code →
              </button>
              
              <div className="resend-section">
                <span className="resend-text">Didn't receive the email? </span>
                <button 
                  type="button" 
                  className="resend-link" 
                  onClick={(e) => {
                    setSuccess(false);
                    setLoading(false);
                    setError('');
                  }}
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Resend'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-content">
        <div className="forgot-password-form-container">
          <button className="back-button" onClick={handleBackToLogin}>
            ←
          </button>
          
          <div className="header-section">
            <h1>Forgot password?</h1>
            <p>No worries, we'll send you reset instructions.</p>
          </div>

          <form onSubmit={handleSubmit} className="forgot-password-form">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="form-input"
                required
              />
            </div>

            <button 
              type="submit" 
              className="reset-button"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Reset password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
