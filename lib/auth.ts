import axios from 'axios';
import { API_URL } from './config';

// Auth types
export interface User {
  id: string;
  username: string;
  role: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface UserProfile {
  id: string;
  username: string;
  role: string;
  createdAt: string;
}

// Auth API
const authApi = axios.create({
  baseURL: `${API_URL}/api/auth`,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

export const auth = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await authApi.post('/login', credentials);
    return response.data;
  },

  // Get user profile
  getProfile: async (token: string): Promise<{ success: boolean; data: UserProfile }> => {
    const response = await authApi.get('/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Verify token
  verifyToken: async (token: string): Promise<{ success: boolean; data: { valid: boolean; user: User } }> => {
    const response = await authApi.get('/verify', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

// Token management
export const tokenStorage = {
  get: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  },

  set: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_token', token);
  },

  remove: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
  },
};

// User management
export const userStorage = {
  get: (): User | null => {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
  },

  set: (user: User): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_user', JSON.stringify(user));
  },

  remove: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_user');
  },
};
