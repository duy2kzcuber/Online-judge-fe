export interface BaseAPIResponse<T = unknown> {
  code: number;
  message?: string;
  data?: T;
  token?: string;
}

export interface AuthResponse {
  token?: string;
  authenticated?: boolean;
  isAuthenticated?: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthUser {
  userId: string;
  username: string;
  email: string;
  avatar: string;
  scope: string;
  roles: string[];
  permissions: string[];
  exp?: number;
}

export interface JwtPayload {
  sub?: string;
  userId?: string;
  scope?: string;
  exp?: number;
  iss?: string;
  jti?: string;
}
