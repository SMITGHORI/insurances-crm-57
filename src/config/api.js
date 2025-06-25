
// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: '/auth',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  
  // Clients
  CLIENTS: '/clients',
  CLIENT_SEARCH: '/clients/search',
  CLIENT_EXPORT: '/clients/export',
  
  // Policies
  POLICIES: '/policies',
  POLICY_SEARCH: '/policies/search',
  POLICY_EXPORT: '/policies/export',
  POLICY_RENEW: '/policies/renew',
  
  // Claims
  CLAIMS: '/claims',
  CLAIM_SEARCH: '/claims/search',
  CLAIM_EXPORT: '/claims/export',
  CLAIM_APPROVE: '/claims/approve',
  CLAIM_REJECT: '/claims/reject',
  
  // Leads
  LEADS: '/leads',
  LEAD_SEARCH: '/leads/search',
  LEAD_ASSIGN: '/leads/assign',
  LEAD_CONVERT: '/leads/convert',
  
  // Agents
  AGENTS: '/agents',
  AGENT_SEARCH: '/agents/search',
  AGENT_PERFORMANCE: '/agents/performance',
  
  // Quotations
  QUOTATIONS: '/quotations',
  QUOTATION_SEARCH: '/quotations/search',
  QUOTATION_SEND: '/quotations/send',
  
  // Dashboard
  DASHBOARD: '/dashboard',
  DASHBOARD_STATS: '/dashboard/stats',
  DASHBOARD_ANALYTICS: '/dashboard/analytics',
  
  // Communication
  COMMUNICATION: '/communication',
  COMMUNICATION_SEND: '/communication/send',
  COMMUNICATION_TEMPLATES: '/communication/templates',
  
  // Broadcast
  BROADCAST: '/broadcast',
  ENHANCED_BROADCAST: '/enhanced-broadcast',
  
  // Activities
  ACTIVITIES: '/activities',
  
  // Header
  HEADER: '/header',
  NOTIFICATIONS: '/header/notifications',
  MESSAGES: '/header/messages',
  
  // Settings
  SETTINGS: '/settings',
  
  // Invoices
  INVOICES: '/invoices',
  INVOICE_SEARCH: '/invoices/search',
  INVOICE_STATS: '/invoices/stats',
  INVOICE_SEND: '/invoices/send',
  INVOICE_EXPORT: '/invoices/export'
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Request Methods
export const REQUEST_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE'
};

// Common Headers
export const COMMON_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

export default {
  API_CONFIG,
  API_ENDPOINTS,
  HTTP_STATUS,
  REQUEST_METHODS,
  COMMON_HEADERS
};
