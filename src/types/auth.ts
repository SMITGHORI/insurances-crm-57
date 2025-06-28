
export interface Permission {
  module: string;
  actions: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: Permission[];
  flatPermissions: string[]; // New: flattened permissions from backend
  branch: string;
  lastUpdated?: Date;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshPermissions: () => Promise<void>;
  hasPermission: (module: string, action: string) => boolean;
  hasAnyPermission: (actions: string[]) => boolean;
  isSameBranch: (recordBranch: string) => boolean;
  isSuperAdmin: () => boolean;
  isAuthenticated: boolean;
}

export interface JWTPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
  permissions: Permission[];
  flatPermissions: string[]; // New: for optimized permission checking
  branch: string;
  exp: number;
  iat: number;
}
