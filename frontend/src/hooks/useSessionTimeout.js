import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to handle session timeout on user inactivity
 * @param {Function} onTimeout - Callback function when session times out
 * @param {number} timeout - Timeout duration in milliseconds (default: 30 minutes)
 * @param {boolean} enabled - Whether the timeout is enabled (default: true)
 */
const useSessionTimeout = (onTimeout, timeout = 30 * 60 * 1000, enabled = true) => {
  const timeoutIdRef = useRef(null);
  const warningTimeoutIdRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    if (warningTimeoutIdRef.current) {
      clearTimeout(warningTimeoutIdRef.current);
      warningTimeoutIdRef.current = null;
    }
  }, []);

  // Handle session timeout
  const handleTimeout = useCallback(() => {
    console.log('Session timed out due to inactivity');
    clearTimers();
    if (onTimeout && typeof onTimeout === 'function') {
      onTimeout();
    }
  }, [onTimeout, clearTimers]);

  // Reset the inactivity timer
  const resetTimer = useCallback(() => {
    if (!enabled) return;

    lastActivityRef.current = Date.now();
    clearTimers();

    // Set main timeout
    timeoutIdRef.current = setTimeout(() => {
      handleTimeout();
    }, timeout);
  }, [enabled, timeout, handleTimeout, clearTimers]);

  // Handle user activity
  const handleActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  // Handle visibility change (tab becomes inactive/active)
  const handleVisibilityChange = useCallback(() => {
    if (!enabled) return;

    if (document.hidden) {
      // Tab became inactive - store the current time
      lastActivityRef.current = Date.now();
    } else {
      // Tab became active - check if timeout period has passed
      const inactiveTime = Date.now() - lastActivityRef.current;
      
      if (inactiveTime >= timeout) {
        // User was inactive for too long
        handleTimeout();
      } else {
        // Still within timeout, reset the timer
        resetTimer();
      }
    }
  }, [enabled, timeout, handleTimeout, resetTimer]);

  useEffect(() => {
    if (!enabled) {
      clearTimers();
      return;
    }

    // Initialize timer
    resetTimer();

    // Events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Add event listeners for user activity
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    return () => {
      clearTimers();
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, resetTimer, handleActivity, handleVisibilityChange, clearTimers]);

  return {
    resetTimer,
    clearTimers
  };
};

export default useSessionTimeout;
