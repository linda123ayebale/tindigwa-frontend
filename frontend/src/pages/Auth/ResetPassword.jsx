import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import ApiService from '../../services/api';
import './ResetPassword.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || '';

  const [formData, setFormData] = useState({
    email: emailFromState,
    otpCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect to forgot password if no email
  useEffect(() => {
    if (!emailFromState) {
      navigate('/forgot-password');
    }
  }, [emailFromState, navigate]);

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

    // Validation
    if (!formData.otpCode || formData.otpCode.trim().length !== 6) {
      setError('Please enter a valid 6-digit verification code');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Call reset password API
      const response = await ApiService.post('/auth/reset-password', {
        email: formData.email,
        otpCode: formData.otpCode.trim(),
        newPassword: formData.newPassword
      });

      if (response && response.success) {
        console.log('Password reset successful');
        setSuccess(true);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to reset password. Please try again.');
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (success) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-content">
          <div className="reset-password-form-container">
            <div className="success-section">
              <div className="success-icon">✅</div>
              <h1>Password Reset Successful!</h1>
              <p>
                Your password has been reset successfully.
              </p>
              <p className="success-subtitle">
                You can now login with your new password. Redirecting to login page...
              </p>
              
              <button 
                className="back-to-login-button"
                onClick={handleBackToLogin}
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-content">
        <div className="reset-password-form-container">
          <button className="back-button" onClick={handleBackToLogin}>
            ←
          </button>
          
          <div className="header-section">
            <h1>Reset Password</h1>
            <p>Enter the verification code sent to <strong>{formData.email}</strong></p>
          </div>

          <form onSubmit={handleSubmit} className="reset-password-form">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="otpCode">Verification Code</label>
              <input
                type="text"
                id="otpCode"
                name="otpCode"
                value={formData.otpCode}
                onChange={handleChange}
                placeholder="Enter 6-digit code"
                className="form-input otp-input"
                maxLength="6"
                pattern="[0-9]{6}"
                required
              />
              <p className="input-hint">Check your email for the 6-digit code</p>
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  className="form-input password-input"
                  minLength="6"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  className="form-input password-input"
                  minLength="6"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={toggleConfirmPasswordVisibility}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="reset-button"
              disabled={loading}
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>

            <div className="back-link">
              <button 
                type="button" 
                className="link-button" 
                onClick={() => navigate('/forgot-password')}
              >
                ← Back to Forgot Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
