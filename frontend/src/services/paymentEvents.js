// Payment Events System
// This provides a simple event system for cross-component payment updates

class PaymentEvents {
  constructor() {
    this.listeners = {
      'payment-added': [],
      'payment-updated': [],
      'payment-deleted': [],
      'payments-refreshed': []
    };
  }

  // Subscribe to payment events
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    } else {
      console.warn(`Unknown payment event: ${event}`);
    }

    // Return unsubscribe function
    return () => {
      this.off(event, callback);
    };
  }

  // Unsubscribe from payment events
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  // Emit payment event
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in payment event listener for ${event}:`, error);
        }
      });
    } else {
      console.warn(`Unknown payment event: ${event}`);
    }
  }

  // Helper methods for common events
  paymentAdded(paymentData) {
    console.log('Payment event: payment-added', paymentData);
    this.emit('payment-added', paymentData);
  }

  paymentUpdated(paymentData) {
    console.log('Payment event: payment-updated', paymentData);
    this.emit('payment-updated', paymentData);
  }

  paymentDeleted(paymentId) {
    console.log('Payment event: payment-deleted', paymentId);
    this.emit('payment-deleted', { paymentId });
  }

  paymentsRefreshed() {
    console.log('Payment event: payments-refreshed');
    this.emit('payments-refreshed');
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new PaymentEvents();