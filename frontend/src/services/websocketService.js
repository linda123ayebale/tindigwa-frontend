import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = {};
  }

  connect(onConnectCallback, onErrorCallback) {
    const WS_URL = 'http://localhost:8081/ws';
    
    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: {},
      debug: (str) => {
        console.log('STOMP Debug:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = (frame) => {
      console.log('WebSocket Connected:', frame);
      this.connected = true;
      if (onConnectCallback) {
        onConnectCallback(frame);
      }
    };

    this.client.onStompError = (frame) => {
      console.error('STOMP Error:', frame.headers['message']);
      console.error('Details:', frame.body);
      this.connected = false;
      if (onErrorCallback) {
        onErrorCallback(frame);
      }
    };

    this.client.onWebSocketError = (error) => {
      console.error('WebSocket Error:', error);
      this.connected = false;
    };

    this.client.onDisconnect = () => {
      console.log('WebSocket Disconnected');
      this.connected = false;
    };

    this.client.activate();
  }

  disconnect() {
    if (this.client && this.connected) {
      this.client.deactivate();
      this.connected = false;
      console.log('WebSocket disconnected');
    }
  }

  subscribeToDashboardUpdates(callback) {
    if (!this.client || !this.connected) {
      console.warn('WebSocket not connected. Cannot subscribe.');
      return null;
    }

    const subscription = this.client.subscribe('/topic/dashboard', (message) => {
      try {
        const data = JSON.parse(message.body);
        console.log('Dashboard update received:', data);
        callback(data);
      } catch (error) {
        console.error('Error parsing dashboard update:', error);
      }
    });

    this.subscriptions['dashboard'] = subscription;
    return subscription;
  }

  subscribeToMetricUpdates(callback) {
    if (!this.client || !this.connected) {
      console.warn('WebSocket not connected. Cannot subscribe.');
      return null;
    }

    const subscription = this.client.subscribe('/topic/dashboard/metrics', (message) => {
      try {
        const data = JSON.parse(message.body);
        console.log('Metric update received:', data);
        callback(data);
      } catch (error) {
        console.error('Error parsing metric update:', error);
      }
    });

    this.subscriptions['metrics'] = subscription;
    return subscription;
  }

  subscribeToDashboardEvents(callback) {
    if (!this.client || !this.connected) {
      console.warn('WebSocket not connected. Cannot subscribe.');
      return null;
    }

    const subscription = this.client.subscribe('/topic/dashboard/events', (message) => {
      try {
        const data = JSON.parse(message.body);
        console.log('Dashboard event received:', data);
        callback(data);
      } catch (error) {
        console.error('Error parsing dashboard event:', error);
      }
    });

    this.subscriptions['events'] = subscription;
    return subscription;
  }

  unsubscribe(subscriptionKey) {
    if (this.subscriptions[subscriptionKey]) {
      this.subscriptions[subscriptionKey].unsubscribe();
      delete this.subscriptions[subscriptionKey];
      console.log(`Unsubscribed from ${subscriptionKey}`);
    }
  }

  unsubscribeAll() {
    Object.keys(this.subscriptions).forEach(key => {
      this.unsubscribe(key);
    });
  }

  /**
   * Subscribe to loan events
   * Handles: loan.created, loan.status.updated, loan.approved, loan.rejected, 
   *          loan.payment.recorded, loan.balance.updated
   */
  subscribeToLoans(callback) {
    if (!this.client || !this.connected) {
      console.warn('WebSocket not connected. Cannot subscribe to loans.');
      return null;
    }

    const subscription = this.client.subscribe('/topic/loans', (message) => {
      try {
        const data = JSON.parse(message.body);
        console.log('Loan event received:', data);
        callback(data);
      } catch (error) {
        console.error('Error parsing loan event:', error);
      }
    });

    this.subscriptions['loans'] = subscription;
    return subscription;
  }

  /**
   * Subscribe to payment events
   * Handles: payment.recorded, payment.reversed
   */
  subscribeToPayments(callback) {
    if (!this.client || !this.connected) {
      console.warn('WebSocket not connected. Cannot subscribe to payments.');
      return null;
    }

    const subscription = this.client.subscribe('/topic/payments', (message) => {
      try {
        const data = JSON.parse(message.body);
        console.log('Payment event received:', data);
        callback(data);
      } catch (error) {
        console.error('Error parsing payment event:', error);
      }
    });

    this.subscriptions['payments'] = subscription;
    return subscription;
  }

  /**
   * Subscribe to expense events
   * Handles: expense events (existing functionality, added for completeness)
   */
  subscribeToExpenses(callback) {
    if (!this.client || !this.connected) {
      console.warn('WebSocket not connected. Cannot subscribe to expenses.');
      return null;
    }

    const subscription = this.client.subscribe('/topic/expenses', (message) => {
      try {
        const data = JSON.parse(message.body);
        console.log('Expense event received:', data);
        callback(data);
      } catch (error) {
        console.error('Error parsing expense event:', error);
      }
    });

    this.subscriptions['expenses'] = subscription;
    return subscription;
  }

  isConnected() {
    return this.connected;
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new WebSocketService();
