
import { API_CONFIG, API_ENDPOINTS } from '../../config/api';

/**
 * Backend API service for header data operations
 */
class HeaderBackendApiService {
  constructor() {
    this.baseURL = `${API_CONFIG.BASE_URL}/header`;
  }

  /**
   * Generic API request handler with error handling
   */
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization token
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
      }

      return responseData;
    } catch (error) {
      console.error('Header API Request failed:', error.message);
      throw error;
    }
  }

  /**
   * Get profile data for header
   */
  async getProfileData() {
    const response = await this.request('/profile');
    return response.data;
  }

  /**
   * Get notifications for header dropdown
   */
  async getNotifications(limit = 5) {
    const response = await this.request(`/notifications?limit=${limit}`);
    return response.data;
  }

  /**
   * Get messages for header dropdown
   */
  async getMessages(limit = 5) {
    const response = await this.request(`/messages?limit=${limit}`);
    return response.data;
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId) {
    const response = await this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
    return response;
  }

  /**
   * Mark message as read
   */
  async markMessageAsRead(messageId) {
    const response = await this.request(`/messages/${messageId}/read`, {
      method: 'PUT',
    });
    return response;
  }

  /**
   * Format notification for display
   */
  formatNotification(notification) {
    return {
      ...notification,
      timeAgo: this.getTimeAgo(notification.createdAt),
      icon: this.getNotificationIcon(notification.type),
      color: this.getNotificationColor(notification.type)
    };
  }

  /**
   * Format message for display
   */
  formatMessage(message) {
    return {
      ...message,
      timeAgo: this.getTimeAgo(message.createdAt),
      initials: this.getInitials(message.sender.name),
      previewText: message.preview.length > 50 
        ? `${message.preview.substring(0, 50)}...` 
        : message.preview
    };
  }

  /**
   * Get time ago string
   */
  getTimeAgo(date) {
    const now = new Date();
    const diffInMinutes = Math.floor((now - new Date(date)) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  /**
   * Get notification icon based on type
   */
  getNotificationIcon(type) {
    const icons = {
      'info': 'Info',
      'warning': 'AlertTriangle',
      'success': 'CheckCircle',
      'error': 'XCircle'
    };
    return icons[type] || 'Bell';
  }

  /**
   * Get notification color based on type
   */
  getNotificationColor(type) {
    const colors = {
      'info': 'text-blue-600',
      'warning': 'text-yellow-600',
      'success': 'text-green-600',
      'error': 'text-red-600'
    };
    return colors[type] || 'text-gray-600';
  }

  /**
   * Get initials from name
   */
  getInitials(name) {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}

// Export singleton instance
export const headerBackendApi = new HeaderBackendApiService();
export default headerBackendApi;
