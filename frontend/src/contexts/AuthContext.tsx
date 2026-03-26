import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User, UserRole } from '@/types';
import axios from 'axios';
import { TokenManager } from '@/services/api';

const TOKEN_KEY = 'nexa_auth_token';
const USER_KEY = 'nexa_auth_user';

interface AuthState {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    role: null,
    isLoading: false,
  });
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // Initialize from localStorage
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setState({
          user,
          token,
          role: user.role as UserRole,
          isLoading: false,
        });
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setState(s => ({ ...s, isLoading: true }));
    setError(null);

    try {
      // Call backend API
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      const { data } = response.data;
      const now = new Date().toISOString();
      const user: User = {
        id: data.user.id,
        email: data.user.email,
        first_name: data.user.name?.split(' ')[0] || 'User',
        last_name: data.user.name?.split(' ')[1] || '',
        full_name: data.user.name,
        role: (data.user.role?.toLowerCase() || 'user') as UserRole,
        is_active: data.user.isActive !== false,
        is_verified: data.user.isVerified === true,
        created_at: data.user.createdAt || now,
        updated_at: data.user.updatedAt || now,
      };

      // Store to localStorage
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      TokenManager.setTokens({
        access_token: data.token,
        refresh_token: data.refreshToken || '',
        token_type: 'bearer',
        expires_in: data.expiresIn || 0,
      });

      setState({
        user,
        token: data.token,
        role: user.role,
        isLoading: false,
      });

      return true;
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const message = axiosError.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      setState(s => ({ ...s, isLoading: false }));
      return false;
    }
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
      setState(s => ({ ...s, isLoading: true }));
      setError(null);

      try {
        // Call backend API
        const response = await axios.post(`${API_BASE_URL}/auth/register`, {
          name,
          email,
          password,
          role: role.toLowerCase(),
        });

        const { data } = response.data;
        const now = new Date().toISOString();
        const user: User = {
          id: data.user.id,
          email: data.user.email,
          first_name: data.user.name?.split(' ')[0] || 'User',
          last_name: data.user.name?.split(' ')[1] || '',
          full_name: data.user.name,
          role: (data.user.role?.toLowerCase() || 'user') as UserRole,
          is_active: data.user.isActive !== false,
          is_verified: data.user.isVerified === true,
          created_at: data.user.createdAt || now,
          updated_at: data.user.updatedAt || now,
        };

        // Store to localStorage
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        TokenManager.setTokens({
          access_token: data.token,
          refresh_token: data.refreshToken || '',
          token_type: 'bearer',
          expires_in: data.expiresIn || 0,
        });

        setState({
          user,
          token: data.token,
          role: user.role,
          isLoading: false,
        });

        return true;
      } catch (err: unknown) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        const message = axiosError.response?.data?.message || 'Registration failed. Please try again.';
        setError(message);
        setState(s => ({ ...s, isLoading: false }));
        return false;
      }
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    TokenManager.setTokens(null);
    setState({
      user: null,
      token: null,
      role: null,
      isLoading: false,
    });
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setState((current) => {
      if (!current.user) {
        return current;
      }

      const nextUser = { ...current.user, ...updates };
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));

      return {
        ...current,
        user: nextUser,
        role: nextUser.role,
      };
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser, error, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
