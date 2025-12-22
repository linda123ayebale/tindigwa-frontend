import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
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

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setError('');

  //   try {
  //     // Validate email format
  //     const emailValidation = validateEmail(formData.email, true);
  //     if (!emailValidation.isValid) {
  //       setError(emailValidation.error);
  //       setLoading(false);
  //       return;
  //     }
      
  //     if (formData.email && formData.password) {
  //       // Use real authentication service
  //       const response = await AuthService.login(formData.email, formData.password);
        
  //       console.log('Login response:', response);
        
  //       // Check if OTP is required (2FA enabled)
  //       if (response.requiresOtp) {
  //         console.log('2FA enabled - redirecting to OTP verification');
  //         // Clear form but keep error state
  //         setFormData({ email: '', password: '' });
  //         // Redirect to OTP verification page
  //         navigate('/verify-otp');
  //         return;
  //       }
        
  //       // Normal login flow (no 2FA)
  //       console.log('Login successful (no 2FA)');
        
  //       // Clear form data after successful login
  //       clearForm();
        
  //       // Set authentication state
  //       setIsAuthenticated(true);
        
  //     console.log('Login successful (no 2FA)');
  //     // Store auth token if provided
  //     if (response.token) {
  //       localStorage.setItem('authToken', response.token);
  //     }

  //       // Small delay to ensure token is properly stored before navigation
  //       setTimeout(() => {
  //         navigate('/dashboard');
  //       }, 100);
  //     } else {
  //       setError('Please enter both email and password');
  //     }
  //   } catch (err) {
  //     console.error('Login error:', err);
      
  //     // Provide user-friendly error messages
  //     let errorMessage = 'Login failed. Please try again.';
      
  //     if (err.message) {
  //       const msg = err.message.toLowerCase();
        
  //       // Handle specific error cases
  //       if (msg.includes('invalid username or password') || 
  //           msg.includes('bad credentials') || 
  //           msg.includes('401')) {
  //         errorMessage = 'Incorrect email or password. Please try again.';
  //       } else if (msg.includes('user not found') || msg.includes('404')) {
  //         errorMessage = 'No account found with this email address.';
  //       } else if (msg.includes('cannot connect') || msg.includes('network') || msg.includes('fetch')) {
  //         errorMessage = 'Unable to connect to server. Please check your internet connection.';
  //       } else if (msg.includes('session has expired') || msg.includes('403')) {
  //         errorMessage = 'Your session has expired. Please try logging in again.';
  //       } else if (!msg.includes('http error')) {
  //         // If it's a clear message from backend (not a generic HTTP error), use it
  //         errorMessage = err.message;
  //       }
  //     }
      
  //     setError(errorMessage);
  //   } finally {
  //     setLoading(false);
  //   }
  // };


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
      // Call login API
      const response = await AuthService.login(formData.email, formData.password);
      console.log('Login response:', response);

      // Check if OTP is required
      if (response.requiresOtp) {
        console.log('2FA enabled - redirecting to OTP verification');
        // Save email or other info if needed
        setFormData({ email: '', password: '' }); // Reset form
        // Redirect to OTP verification page
        navigate('/verify-otp', { state: { email: formData.email } });
        return;
      }

      // If no OTP required, login success
      console.log('Login successful (no 2FA)');
      // Store auth token if any
      if (response.token) {
        localStorage.setItem('authToken', response.token);
      }
      // Set auth state
      setIsAuthenticated(true);
      // Redirect to login page
      navigate('/login');
    } else {
      setError('Please enter both email and password');
    }
  } catch (err) {
    console.error('Login error:', err);
    let errorMessage = 'Login failed. Please try again.';
    if (err.message) {
      const msg = err.message.toLowerCase();
      if (
        msg.includes('invalid username or password') ||
        msg.includes('bad credentials') ||
        msg.includes('401')
      ) {
        errorMessage = 'Incorrect email or password. Please try again.';
      } else if (msg.includes('user not found') || msg.includes('404')) {
        errorMessage = 'No account found with this email address.';
      } else if (
        msg.includes('cannot connect') ||
        msg.includes('network') ||
        msg.includes('fetch')
      ) {
        errorMessage =
          'Unable to connect to server. Please check your internet connection.';
      } else if (msg.includes('session has expired') || msg.includes('403')) {
        errorMessage = 'Your session has expired. Please try logging in again.';
      } else {
        errorMessage = err.message;
      }
    }
    setError(errorMessage);
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

  const handleClearFormData = () => {
    // Clear all browser stored data
    localStorage.clear();
    sessionStorage.clear();
    
    // Reload the page to clear form and remain on login
    window.location.reload();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
              <div className="password-input-wrapper">
                <input
                  key={`password-${fieldKey}`}
                  type={showPassword ? "text" : "password"}
                  id={`password-${fieldKey}`}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="form-input password-input"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-form-type="other"
                  data-lpignore="true"
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
                  onClick={handleClearFormData}
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
