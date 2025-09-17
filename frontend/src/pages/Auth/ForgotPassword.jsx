import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

    // Basic email validation
    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      // Simulate API call for password reset
      setTimeout(() => {
        // Mock successful password reset request
        setSuccess(true);
        setLoading(false);
      }, 2000);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
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
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="success-subtitle">
                Click the link in the email to reset your password. If you don't see it, check your spam folder.
              </p>
              
              <button 
                className="back-to-login-button"
                onClick={handleBackToLogin}
              >
                ← Back to Login
              </button>
              
              <div className="resend-section">
                <span className="resend-text">Didn't receive the email? </span>
                <button 
                  type="button" 
                  className="resend-link" 
                  onClick={handleSubmit}
                >
                  Resend
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
