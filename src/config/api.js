
// API Configuration for different environments
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:5000/api',
    timeout: 10000,
  },
  production: {
    baseURL: process.env.REACT_APP_API_URL || 'https://your-backend-domain.com/api',
    timeout: 15000,
  }
};

const environment = process.env.NODE_ENV || 'development';
export const apiConfig = API_CONFIG[environment];

// Export API_CONFIG for backward compatibility
export { API_CONFIG };

// API Endpoints
export const API_ENDPOINTS = {
  CLAIMS: '/claims',
  CLIENTS: '/clients',
  AGENTS: '/agents',
  POLICIES: '/policies',
  AUTH: '/auth',
  UPLOAD: '/upload'
};

// HTTP Status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

// Default headers for all API requests
export const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Auth token management
export const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

export const setAuthToken = (token) => {
  localStorage.setItem('auth_token', token);
};

export const removeAuthToken = () => {
  localStorage.removeItem('auth_token');
};

// Create authorized headers with token
export const getAuthorizedHeaders = () => {
  const token = getAuthToken();
  return {
    ...defaultHeaders,
    ...(token && { Authorization: `Bearer ${token}` })
  };
};
