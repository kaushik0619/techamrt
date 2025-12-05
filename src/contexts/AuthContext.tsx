import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { api } from '../lib/api';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'customer' | 'admin';
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const data: any = await api.post('/api/auth/login', { email, password });

    if (!data || !data.token) {
      throw new Error(data?.message || 'Login failed');
    }

    // Store token in both keys for compatibility with api helper
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('token', data.token);
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const register = async (username: string, email: string, password: string) => {
    const data: any = await api.post('/api/auth/register', { username, email, password });

    if (!data || !data.token) {
      throw new Error(data?.message || 'Registration failed');
    }

    localStorage.setItem('authToken', data.token);
    localStorage.setItem('token', data.token);
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const resetPassword = async (email: string) => {
    const data: any = await api.post('/api/auth/forgot-password', { email });
    if (!data) {
      throw new Error('Invalid response from server');
    }

    if (!data.success) {
      throw new Error(data.message || 'Failed to send reset email');
    }

    return data;
  };

  const logout = () => {
    // Clear both token keys and any refresh token to stay consistent with api.ts
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, resetPassword, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}