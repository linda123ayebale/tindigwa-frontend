import { useEffect, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { toast } from 'react-hot-toast';

const API_BASE_WS_URL = process.env.REACT_APP_WS_URL;

const useExpenseWebSocket = (onMessage) => {
  const clientRef = useRef(null);
  const isConnectedRef = useRef(false);

  const connect = useCallback(() => {
    if (isConnectedRef.current) return;

    const socket = new SockJS(API_BASE_WS_URL ? API_BASE_WS_URL : 'http://localhost:8081/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket connected');
        isConnectedRef.current = true;
        
        client.subscribe('/topic/expenses', (message) => {
          try {
            const data = JSON.parse(message.body);
            console.log('Received expense update:', data);
            
            // Show toast notification
            const actionMessages = {
              CREATED: '🆕',
              APPROVED: '✅',
              REJECTED: '❌',
              PAID: '💰'
            };
            
            toast.success(`${actionMessages[data.action] || ''} ${data.message}`, {
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
        console.log('WebSocket disconnected');
        isConnectedRef.current = false;
      },
      onStompError: (frame) => {
        console.error('WebSocket error:', frame);
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

export default useExpenseWebSocket;
