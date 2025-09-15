'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, tokenStorage, userStorage, User } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = tokenStorage.get();
      const storedUser = userStorage.get();

      if (storedToken && storedUser) {
        try {
          // Verify token is still valid
          const verifyResult = await auth.verifyToken(storedToken);
          if (verifyResult.success && verifyResult.data.valid) {
            setToken(storedToken);
            setUser(storedUser);
          } else {
            // Token is invalid, clear storage
            tokenStorage.remove();
            userStorage.remove();
          }
        } catch (error) {
          // Token verification failed, clear storage
          tokenStorage.remove();
          userStorage.remove();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await auth.login({ username, password });
      
      if (response.success) {
        const { token: newToken, user: newUser } = response.data;
        
        // Store in state
        setToken(newToken);
        setUser(newUser);
        
        // Store in localStorage
        tokenStorage.set(newToken);
        userStorage.set(newUser);
        
        return { success: true };
      } else {
        return { success: false, error: 'Giriş başarısız' };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Giriş sırasında bir hata oluştu';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    tokenStorage.remove();
    userStorage.remove();
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
