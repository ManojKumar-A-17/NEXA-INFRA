import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User, UserRole } from '@/types';

const ADMIN_EMAIL = 'aamanojkumar190@gmail.com';
const REGISTRY_KEY = 'nexa_infra_user_registry';

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
  loginAs: (role: UserRole) => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    role: null,
    isLoading: false,
  });
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const getRegistry = useCallback(() => {
    try {
      const stored = localStorage.getItem(REGISTRY_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }, []);

  const saveToRegistry = useCallback((email: string, userData: any) => {
    const registry = getRegistry();
    registry[email] = { ...userData, createdAt: new Date().toISOString() };
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
  }, [getRegistry]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setState(s => ({ ...s, isLoading: true }));
    setError(null);
    
    await new Promise(r => setTimeout(r, 800));
    
    // Admin email bypass
    if (email === ADMIN_EMAIL) {
      const adminUser: User = {
        id: 'admin-1',
        name: 'Admin User',
        email: ADMIN_EMAIL,
        role: 'SUPER_ADMIN',
        createdAt: new Date().toISOString()
      };
      setState({ user: adminUser, token: 'admin-token', role: 'SUPER_ADMIN', isLoading: false });
      return true;
    }
    
    // Check registry
    const registry = getRegistry();
    const userData = registry[email];
    
    if (!userData) {
      setError('Email not registered. Please sign up first.');
      setState(s => ({ ...s, isLoading: false }));
      return false;
    }
    
    if (userData.password !== password) {
      setError('Invalid password.');
      setState(s => ({ ...s, isLoading: false }));
      return false;
    }
    
    const user: User = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      createdAt: userData.createdAt
    };
    
    setState({ user, token: 'user-token', role: userData.role, isLoading: false });
    return true;
  }, [getRegistry]);

  const register = useCallback(async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    setState(s => ({ ...s, isLoading: true }));
    setError(null);
    
    await new Promise(r => setTimeout(r, 800));
    
    // Block admin email registration
    if (email === ADMIN_EMAIL) {
      setError('This email is reserved for system administration.');
      setState(s => ({ ...s, isLoading: false }));
      return false;
    }
    
    // Check if email already exists
    const registry = getRegistry();
    if (registry[email]) {
      setError('Email already registered. Please use a different email or sign in.');
      setState(s => ({ ...s, isLoading: false }));
      return false;
    }
    
    // Save to registry
    const userData = {
      id: Date.now().toString(),
      name,
      email,
      password,
      role
    };
    
    saveToRegistry(email, userData);
    
    const user: User = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      createdAt: new Date().toISOString()
    };
    
    setState({ user, token: 'user-token', role, isLoading: false });
    return true;
  }, [getRegistry, saveToRegistry]);

  const logout = useCallback(() => {
    setState({ user: null, token: null, role: null, isLoading: false });
    setError(null);
  }, []);

  const loginAs = useCallback((role: UserRole) => {
    const mockUser: User = { id: Date.now().toString(), name: 'Mock User', email: 'mock@example.com', role, createdAt: new Date().toISOString() };
    setState({ user: mockUser, token: 'mock-token', role, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, loginAs, error, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
