
import { API_CONFIG, API_ENDPOINTS } from '../../config/api';

/**
 * Backend API service for settings operations
 * Connects to Node.js + Express + MongoDB backend
 */
class SettingsBackendApiService {
  constructor() {
    this.baseURL = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.SETTINGS || '/settings'}`;
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
      console.error('Settings API Request failed:', error.message);
      throw error;
    }
  }

  /**
   * Get user settings
   */
  async getSettings() {
    const response = await this.request('');
    return response.data;
  }

  /**
   * Create settings for user
   */
  async createSettings(settingsData) {
    const response = await this.request('', {
      method: 'POST',
      body: JSON.stringify(settingsData),
    });
    return response.data;
  }

  /**
   * Update user settings
   */
  async updateSettings(settingsData) {
    const response = await this.request('', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    });
    return response.data;
  }

  /**
   * Update profile settings
   */
  async updateProfile(profileData) {
    const response = await this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    return response.data;
  }

  /**
   * Update notification settings
   */
  async updateNotifications(notificationData) {
    const response = await this.request('/notifications', {
      method: 'PUT',
      body: JSON.stringify(notificationData),
    });
    return response.data;
  }

  /**
   * Update security settings
   */
  async updateSecurity(securityData) {
    const response = await this.request('/security', {
      method: 'PUT',
      body: JSON.stringify(securityData),
    });
    return response.data;
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferencesData) {
    const response = await this.request('/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferencesData),
    });
    return response.data;
  }

  /**
   * Update privacy settings
   */
  async updatePrivacy(privacyData) {
    const response = await this.request('/privacy', {
      method: 'PUT',
      body: JSON.stringify(privacyData),
    });
    return response.data;
  }

  /**
   * Change user password
   */
  async changePassword(passwordData) {
    const response = await this.request('/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
    return response;
  }

  /**
   * Reset settings to defaults
   */
  async resetSettings() {
    const response = await this.request('/reset', {
      method: 'POST',
    });
    return response.data;
  }

  /**
   * Delete/deactivate settings
   */
  async deleteSettings() {
    const response = await this.request('', {
      method: 'DELETE',
    });
    return response;
  }

  /**
   * Get settings statistics (Admin only)
   */
  async getSettingsStats() {
    const response = await this.request('/stats');
    return response.data;
  }

  /**
   * Export user settings
   */
  async exportSettings() {
    const response = await this.request('/export');
    return response.data;
  }

  /**
   * Import user settings
   */
  async importSettings(settingsData) {
    const response = await this.request('/import', {
      method: 'POST',
      body: JSON.stringify({ settingsData }),
    });
    return response.data;
  }

  /**
   * Validate email format
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone format
   */
  validatePhone(phone) {
    if (!phone) return true; // Phone is optional
    const phoneRegex = /^(\+\d{1,3}\s?)?\d{10}$|^(\d{3}[-]\d{3}[-]\d{4})$/;
    return phoneRegex.test(phone);
  }

  /**
   * Validate password strength
   */
  validatePassword(password) {
    if (password.length < 8) return false;
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);
    
    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  }

  /**
   * Get password strength score
   */
  getPasswordStrength(password) {
    if (!password) return { score: 0, message: '', color: 'bg-gray-200' };
    
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) score += 1; // Has uppercase
    if (/[a-z]/.test(password)) score += 1; // Has lowercase
    if (/[0-9]/.test(password)) score += 1; // Has number
    if (/[^A-Za-z0-9]/.test(password)) score += 1; // Has special char
    
    // Determine message and color
    let message, color;
    if (score <= 2) {
      message = 'Weak';
      color = 'bg-red-500';
    } else if (score <= 4) {
      message = 'Moderate';
      color = 'bg-yellow-500';
    } else {
      message = 'Strong';
      color = 'bg-green-500';
    }
    
    return { score, message, color };
  }

  /**
   * Format settings for display
   */
  formatSettingsForDisplay(settings) {
    if (!settings) return null;
    
    return {
      ...settings,
      profile: {
        ...settings.profile,
        isComplete: !!(
          settings.profile?.name &&
          settings.profile?.email &&
          settings.profile?.phone &&
          settings.profile?.jobTitle
        )
      },
      security: {
        ...settings.security,
        securityScore: this.calculateSecurityScore(settings.security),
        passwordAge: settings.security?.passwordLastChanged 
          ? Math.floor((Date.now() - new Date(settings.security.passwordLastChanged)) / (1000 * 60 * 60 * 24))
          : null
      }
    };
  }

  /**
   * Calculate security score
   */
  calculateSecurityScore(security) {
    if (!security) return 0;
    
    let score = 0;
    if (security.twoFactorAuth) score += 30;
    if (security.loginAlerts) score += 20;
    if (security.sessionTimeout <= 30) score += 25;
    if (security.passwordLastChanged && 
        Date.now() - new Date(security.passwordLastChanged) < 90 * 24 * 60 * 60 * 1000) score += 25;
    
    return score;
  }

  /**
   * Get default settings structure
   */
  getDefaultSettings() {
    return {
      profile: {
        name: '',
        email: '',
        phone: '',
        jobTitle: '',
        avatar: '',
        bio: ''
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        marketingEmails: false,
        activityNotifications: true,
        systemAlerts: true,
        weeklyReports: true,
        monthlyReports: false
      },
      security: {
        twoFactorAuth: false,
        sessionTimeout: 30,
        loginAlerts: true
      },
      preferences: {
        theme: 'system',
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        currency: 'USD',
        dashboardLayout: 'comfortable',
        itemsPerPage: 20
      },
      privacy: {
        profileVisibility: 'team',
        activityVisibility: 'team',
        dataSharing: false,
        analytics: true
      }
    };
  }

  /**
   * Backup settings to local storage
   */
  backupSettingsLocally(settings) {
    try {
      const backup = {
        settings,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('settingsBackup', JSON.stringify(backup));
      return true;
    } catch (error) {
      console.error('Failed to backup settings locally:', error);
      return false;
    }
  }

  /**
   * Restore settings from local storage
   */
  restoreSettingsFromLocal() {
    try {
      const backup = localStorage.getItem('settingsBackup');
      if (backup) {
        return JSON.parse(backup);
      }
      return null;
    } catch (error) {
      console.error('Failed to restore settings from local storage:', error);
      return null;
    }
  }

  /**
   * Clear local settings backup
   */
  clearLocalBackup() {
    try {
      localStorage.removeItem('settingsBackup');
      return true;
    } catch (error) {
      console.error('Failed to clear local backup:', error);
      return false;
    }
  }
}

// Export singleton instance
export const settingsBackendApi = new SettingsBackendApiService();
export default settingsBackendApi;
