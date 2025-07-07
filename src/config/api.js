
// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-url.com/api' 
    : 'http://localhost:5001/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3
};

export const API_ENDPOINTS = {
  AUTH: '/auth',
  USERS: '/users',
  ROLES: '/roles',
  CLIENTS: '/clients',
  POLICIES: '/policies',
  CLAIMS: '/claims',
  LEADS: '/leads',
  QUOTATIONS: '/quotations',
  OFFERS: '/offers',
  INVOICES: '/invoices',
  AGENTS: '/agents',
  REPORTS: '/reports',
  ACTIVITIES: '/activities'
};

export default API_CONFIG;
