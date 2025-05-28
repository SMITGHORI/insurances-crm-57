/**
 * API configuration for backend integration
 * Centralizes API URLs and settings
 */

// Environment-based API configuration
const getApiBaseUrl = () => {
  // Check for environment variables (Vite uses VITE_ prefix)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Development fallback
  if (import.meta.env.DEV) {
    return 'http://localhost:5000/api';
  }
  
  // Production fallback - replace with your actual production API URL
  return '/api';
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

// API endpoints
export const API_ENDPOINTS = {
  // Client endpoints
  CLIENTS: '/clients',
  CLIENT_BY_ID: (id) => `/clients/${id}`,
  CLIENT_DOCUMENTS: (id) => `/clients/${id}/documents`,
  CLIENT_DOCUMENT: (clientId, documentId) => `/clients/${clientId}/documents/${documentId}`,
  
  // Auth endpoints
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_PROFILE: '/auth/profile',
  
  // Other module endpoints (to be added later)
  POLICIES: '/policies',
  CLAIMS: '/claims',
  AGENTS: '/agents',
  INVOICES: '/invoices',
  QUOTATIONS: '/quotations',
};

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

export default API_CONFIG;
