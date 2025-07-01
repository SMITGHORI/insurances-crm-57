
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const useWebSocket = () => {
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    // WebSocket URL from environment or default
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';
    
    try {
      socketRef.current = new WebSocket(`${wsUrl}?token=${token}`);

      socketRef.current.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
      };

      socketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          console.log('WebSocket message received:', data);

          // Handle specific real-time events
          if (data.type === 'dashboard-update') {
            // Trigger dashboard refresh
            window.dispatchEvent(new CustomEvent('dashboard-refresh', { detail: data.payload }));
          }

          if (data.type === 'notification') {
            toast.info(data.message || 'New update received');
          }

          if (data.type === 'entity-updated') {
            // Trigger entity-specific updates
            window.dispatchEvent(new CustomEvent('entity-updated', { detail: data.payload }));
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      socketRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setConnected(false);
      };

      socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnected(false);
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const sendMessage = (message) => {
    if (socketRef.current && connected) {
      socketRef.current.send(JSON.stringify(message));
    }
  };

  return {
    connected,
    lastMessage,
    sendMessage
  };
};

export default useWebSocket;
