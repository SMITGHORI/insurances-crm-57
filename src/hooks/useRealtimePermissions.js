
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Real-time permissions hook
 * Handles permission updates and WebSocket connections
 */
export const useRealtimePermissions = () => {
  const { user, refreshPermissions } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Skip for demo users
    if (localStorage.getItem('demoMode')) {
      console.log('Demo mode active, skipping real-time permissions');
      return;
    }

    // Set up WebSocket connection for real-time permission updates
    let ws;
    
    try {
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:5001';
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected for permission updates');
        // Send user identification
        ws.send(JSON.stringify({
          type: 'auth',
          userId: user.id,
          token: localStorage.getItem('authToken')
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'permission_update' && data.userId === user.id) {
            console.log('Received permission update', data);
            refreshPermissions();
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.warn('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
      };

    } catch (error) {
      console.warn('WebSocket not available:', error);
    }

    // Cleanup function
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [user, refreshPermissions]);

  // Periodic permission refresh (fallback)
  useEffect(() => {
    if (!user || localStorage.getItem('demoMode')) return;

    const interval = setInterval(() => {
      refreshPermissions();
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [user, refreshPermissions]);
};
