import { useEffect, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { toast } from 'react-hot-toast';

const useLoanProductWebSocket = (onMessage) => {
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
        console.log('Loan Product WebSocket connected');
        isConnectedRef.current = true;
        
        client.subscribe('/topic/loan-products', (message) => {
          try {
            const data = JSON.parse(message.body);
            console.log('Received loan product update:', data);
            
            // Show toast notification
            const actionMessages = {
              'loan.product.created': '🆕 Loan Product Created',
              'loan.product.updated': '✏️ Loan Product Updated',
              'loan.product.deleted': '🗑️ Loan Product Deleted'
            };
            
            toast.success(actionMessages[data.action] || data.message, {
              duration: 4000,
              position: 'top-right',
            });
            
            // Call callback if provided
            if (onMessage) {
              onMessage(data);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        });
      },
      onDisconnect: () => {
        console.log('Loan Product WebSocket disconnected');
        isConnectedRef.current = false;
      },
      onStompError: (frame) => {
        console.error('Loan Product WebSocket error:', frame);
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

export default useLoanProductWebSocket;
