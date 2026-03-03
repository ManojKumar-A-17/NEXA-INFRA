import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User, UserRole } from '@/types';

const ADMIN_EMAIL = 'aamanojkumar190@gmail.com';
const REGISTRY_KEY = 'nexa_infra_user_registry';

type RegistryEntry = { id: string; name: string; email: string; password: string; role: UserRole; createdAt: string };
type Registry = Record<string, RegistryEntry>;

function getRegistry(): Registry {
  try { return JSON.parse(localStorage.getItem(REGISTRY_KEY) || '{}'); } catch { return {}; }
}
function saveRegistry(r: Registry) {
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(r));
}

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

const MOCK_ADMIN: User = { id: 'admin-001', name: 'Admin', email: ADMIN_EMAIL, role: 'SUPER_ADMIN', createdAt: '2024-01-01' };

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null, token: null, role: null, isLoading: false,
  });
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setState(s => ({ ...s, isLoading: true }));
    setError(null);
    await new Promise(r => setTimeout(r, 500));

    // Admin bypass
    if (email === ADMIN_EMAIL) {
      setState({ user: MOCK_ADMIN, token: 'mock-jwt-token', role: 'SUPER_ADMIN', isLoading: false });
      return true;
    }

    // Registry check
    const registry = getRegistry();
    const entry = registry[email.toLowerCase()];
    if (!entry) {
      setState(s => ({ ...s, isLoading: false }));
      setError('No account found for this email. Please register first.');
      return false;
    }
    if (entry.password !== password) {
      setState(s => ({ ...s, isLoading: false }));
      setError('Incorrect password. Please try again.');
      return false;
    }
    const user: User = { id: entry.id, name: entry.name, email: entry.email, role: entry.role, createdAt: entry.createdAt };
    setState({ user, token: 'mock-jwt-token', role: entry.role, isLoading: false });
    return true;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    setState(s => ({ ...s, isLoading: true }));
    setError(null);
    await new Promise(r => setTimeout(r, 500));

    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      setState(s => ({ ...s, isLoading: false }));
      setError('This email address is reserved.');
      return false;
    }

    const registry = getRegistry();
    if (registry[email.toLowerCase()]) {
      setState(s => ({ ...s, isLoading: false }));
      setError('An account with this email already exists. Please sign in.');
      return false;
    }

    const entry: RegistryEntry = { id: Date.now().toString(), name, email: email.toLowerCase(), password, role, createdAt: new Date().toISOString() };
    registry[email.toLowerCase()] = entry;
    saveRegistry(registry);

    const user: User = { id: entry.id, name, email, role, createdAt: entry.createdAt };
    setState({ user, token: 'mock-jwt-token', role, isLoading: false });
    return true;
  }, []);

  const logout = useCallback(() => {
    setState({ user: null, token: null, role: null, isLoading: false });
    setError(null);
  }, []);

  const loginAs = useCallback((targetRole: UserRole) => {
    const mockUser: User = { id: 'demo-001', name: 'Demo User', email: 'demo@nexa-infra.com', role: targetRole, createdAt: new Date().toISOString() };
    setState({ user: mockUser, token: 'mock-jwt-token', role: targetRole, isLoading: false });
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
