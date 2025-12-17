import { useEffect, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { toast } from 'react-hot-toast';

/**
 * Custom hook for Loan WebSocket events
 * Handles: loan.created, loan.status.updated, loan.approved, loan.rejected,
 *          loan.payment.recorded, loan.balance.updated
 */
const useLoanWebSocket = (onMessage) => {
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
        console.log('Loan WebSocket connected');
        isConnectedRef.current = true;
        
        // Subscribe to loan events
        client.subscribe('/topic/loans', (message) => {
          try {
            const data = JSON.parse(message.body);
            console.log('Received loan event:', data);
            
            // Show toast notification based on action
            const actionIcons = {
              'loan.created': '🆕',
              'loan.status.updated': '🔄',
              'loan.approved': '✅',
              'loan.rejected': '❌',
              'loan.payment.recorded': '💰',
              'loan.balance.updated': '📊'
            };
            
            const icon = actionIcons[data.action] || '📢';
            toast.success(`${icon} ${data.message}`, {
              duration: 5000,
              position: 'top-right',
            });
            
            // Call callback if provided
            if (onMessage) {
              onMessage(data);
            }
          } catch (error) {
            console.error('Error parsing loan WebSocket message:', error);
          }
        });
      },
      onDisconnect: () => {
        console.log('Loan WebSocket disconnected');
        isConnectedRef.current = false;
      },
      onStompError: (frame) => {
        console.error('Loan WebSocket error:', frame);
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

export default useLoanWebSocket;
