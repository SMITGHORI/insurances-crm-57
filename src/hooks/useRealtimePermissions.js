
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_CONFIG } from '@/config/api';

/**
 * Real-time permissions hook with MongoDB integration
 * Handles permission updates and WebSocket connections
 */
export const useRealtimePermissions = () => {
  const { user, refreshPermissions } = useAuth();

  useEffect(() => {
    if (!user) return;



    // Set up WebSocket connection for real-time permission updates
    let ws;
    
    try {
      const wsUrl = API_CONFIG.WS_URL;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('MongoDB WebSocket connected for permission updates');
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
            console.log('Received MongoDB permission update', data);
            refreshPermissions();
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.warn('MongoDB WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('MongoDB WebSocket connection closed');
      };

    } catch (error) {
      console.warn('MongoDB WebSocket not available:', error);
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
    if (!user) return;

    const interval = setInterval(() => {
      refreshPermissions();
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [user, refreshPermissions]);
};
