import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/authService';
import './OtpVerification.css';

const OtpVerification = ({ setIsAuthenticated }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // Get userId from sessionStorage
  const userId = sessionStorage.getItem('otp_userId');
  const userEmail = sessionStorage.getItem('otp_userEmail');

  useEffect(() => {
    // Redirect if no userId in session
    if (!userId) {
      navigate('/login');
      return;
    }

    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }

    // Timer for OTP expiry
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Timer for resend cooldown
    const resendTimer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 0) {
          setCanResend(true);
          clearInterval(resendTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(resendTimer);
    };
  }, [userId, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    // Auto-submit when all 6 digits entered
    if (newOtp.every(digit => digit !== '') && index === 5) {
      handleSubmit(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    
    // Handle left arrow
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    
    // Handle right arrow
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Check if pasted data is 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      setError('');
      inputRefs.current[5].focus();
      
      // Auto-submit
      handleSubmit(pastedData);
    }
  };

  const handleSubmit = async (otpCode = null) => {
    const code = otpCode || otp.join('');
    
    if (code.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    if (timeLeft <= 0) {
      setError('Code has expired. Please request a new one.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await AuthService.verifyOtp(userId, code);
      
      console.log('OTP verification successful:', response);
      
      // Clear OTP session data
      sessionStorage.removeItem('otp_userId');
      sessionStorage.removeItem('otp_userEmail');
      
      // Set authentication state
      setIsAuthenticated(true);
      
      // Navigate to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
      
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err.message || 'Invalid verification code. Please try again.');
      
      // Clear OTP inputs on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await AuthService.resendOtp(userId);
      
      // Reset timers
      setTimeLeft(300);
      setResendCooldown(60);
      setCanResend(false);
      
      // Clear OTP inputs
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
      
      // Show success message briefly
      setError('✓ New code sent to your email');
      setTimeout(() => setError(''), 3000);
      
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Clear session data
    sessionStorage.removeItem('otp_userId');
    sessionStorage.removeItem('otp_userEmail');
    
    // Navigate back to login
    navigate('/login');
  };

  return (
    <div className="otp-container">
      <div className="otp-content">
        <div className="otp-form-container">
          
          {/* Header */}
          <div className="otp-header">
            <div className="otp-icon">🔐</div>
            <h1>Enter Verification Code</h1>
            <p className="otp-subtitle">
              We've sent a 6-digit code to<br />
              <strong>{userEmail || 'your email'}</strong>
            </p>
          </div>

          {/* OTP Input */}
          <div className="otp-input-container">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={`otp-input ${error && !error.startsWith('✓') ? 'otp-input-error' : ''}`}
                disabled={loading || timeLeft <= 0}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className={`otp-message ${error.startsWith('✓') ? 'otp-success' : 'otp-error'}`}>
              {error}
            </div>
          )}

          {/* Timer */}
          <div className="otp-timer">
            {timeLeft > 0 ? (
              <>
                ⏱️ Code expires in: <strong>{formatTime(timeLeft)}</strong>
              </>
            ) : (
              <span className="otp-expired">⚠️ Code has expired</span>
            )}
          </div>

          {/* Verify Button */}
          <button
            onClick={() => handleSubmit()}
            className="otp-verify-button"
            disabled={loading || otp.some(digit => digit === '') || timeLeft <= 0}
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>

          {/* Resend Section */}
          <div className="otp-resend-section">
            <p>Didn't receive the code?</p>
            <button
              onClick={handleResend}
              className="otp-resend-button"
              disabled={!canResend || loading}
            >
              {canResend ? 'Resend Code' : `Resend in ${resendCooldown}s`}
            </button>
          </div>

          {/* Cancel Button */}
          <button
            onClick={handleCancel}
            className="otp-cancel-button"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
