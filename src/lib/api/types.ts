export interface BaseAPIResponse<T = unknown> {
  code: number;
  message?: string;
  data?: T;
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
