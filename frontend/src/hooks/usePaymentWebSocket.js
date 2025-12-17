import { useEffect, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { toast } from 'react-hot-toast';

/**
 * Custom hook for Payment WebSocket events
 * Handles: payment.recorded, payment.reversed
 */
const usePaymentWebSocket = (onMessage) => {
  const clientRef = useRef(null);
  const isConnectedRef = useRef(false);

  const connect = useCallback(() => {
    if (isConnectedRef.current) return;

    const socket = new SockJS('http://localhost:8081/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('Payment WebSocket connected');
        isConnectedRef.current = true;
        
        // Subscribe to payment events
        client.subscribe('/topic/payments', (message) => {
          try {
            const data = JSON.parse(message.body);
            console.log('Received payment event:', data);
            
            // Show toast notification based on action
            const actionIcons = {
              'payment.recorded': '💰',
              'payment.reversed': '↩️'
            };
            
            const icon = actionIcons[data.action] || '💳';
            const toastType = data.action === 'payment.reversed' ? 'error' : 'success';
            
            toast[toastType](`${icon} ${data.message}`, {
              duration: 5000,
              position: 'top-right',
            });
            
            // Call callback if provided
            if (onMessage) {
              onMessage(data);
            }
          } catch (error) {
            console.error('Error parsing payment WebSocket message:', error);
          }
        });
      },
      onDisconnect: () => {
        console.log('Payment WebSocket disconnected');
        isConnectedRef.current = false;
      },
      onStompError: (frame) => {
        console.error('Payment WebSocket error:', frame);
      },
    });

    client.activate();
    clientRef.current = client;
  }, [onMessage]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate();
      isConnectedRef.current = false;
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { connect, disconnect, isConnected: isConnectedRef.current };
};

export default usePaymentWebSocket;
