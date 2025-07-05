
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:5001',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_ME: '/auth/me',
  AUTH_REFRESH: '/auth/refresh-permissions',

  // Agents endpoints
  AGENTS: '/agents',
  AGENT_BY_ID: (id) => `/agents/${id}`,
  AGENT_CLIENTS: (id) => `/agents/${id}/clients`,
  AGENT_POLICIES: (id) => `/agents/${id}/policies`,
  AGENT_COMMISSIONS: (id) => `/agents/${id}/commissions`,
  AGENT_PERFORMANCE: (id) => `/agents/${id}/performance`,

  // Clients endpoints
  CLIENTS: '/clients',
  CLIENT_BY_ID: (id) => `/clients/${id}`,

  // Policies endpoints
  POLICIES: '/policies',
  POLICY_BY_ID: (id) => `/policies/${id}`,

  // Claims endpoints
  CLAIMS: '/claims',
  CLAIM_BY_ID: (id) => `/claims/${id}`,

  // Leads endpoints
  LEADS: '/leads',
  LEAD_BY_ID: (id) => `/leads/${id}`,

  // Quotations endpoints
  QUOTATIONS: '/quotations',
  QUOTATION_BY_ID: (id) => `/quotations/${id}`,

  // Invoices endpoints
  INVOICES: '/invoices',
  INVOICE_BY_ID: (id) => `/invoices/${id}`,

  // Dashboard endpoints
  DASHBOARD_STATS: '/dashboard/stats',
  DASHBOARD_ACTIVITIES: '/dashboard/activities',

  // Settings endpoints
  SETTINGS: '/settings',
  SETTINGS_BY_KEY: (key) => `/settings/${key}`,

  // Communication endpoints
  COMMUNICATIONS: '/communications',
  COMMUNICATION_BY_ID: (id) => `/communications/${id}`,

  // Broadcast endpoints
  BROADCASTS: '/broadcasts',
  BROADCAST_BY_ID: (id) => `/broadcasts/${id}`,

  // Activities endpoints
  ACTIVITIES: '/activities',
  ACTIVITY_BY_ID: (id) => `/activities/${id}`
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && token !== 'demo-token-admin' && token !== 'demo-token-agent' && {
      'Authorization': `Bearer ${token}`
    })
  };
};

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const config = {
    headers: getAuthHeaders(),
    ...options
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};
