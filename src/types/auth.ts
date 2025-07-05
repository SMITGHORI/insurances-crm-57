
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
  flatPermissions: string[];
  branch: string;
  lastUpdated: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  exp: number;
  [key: string]: any;
}
