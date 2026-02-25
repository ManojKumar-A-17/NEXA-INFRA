import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authService } from '@/services/auth';
import { User, UserRole } from '@/types';
import { useToast } from '@/hooks/use-toast';

// ============================= ERROR HANDLING TYPE =============================

interface ErrorType {
  message: string;
}

// ============================= TYPES =============================

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
}

interface AuthContextType extends AuthState {
  // Core Auth Methods
  login: (email: string, password: string) => Promise<void>;
  registerUser: (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }) => Promise<void>;
  registerContractor: (contractorData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    company_name: string;
    business_license: string;
    expertise_areas: string[];
    location: string;
    description: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  
  // Password Management
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  
  // OTP & Verification
  verifyOtp: (email: string, otp: string, purpose: string) => Promise<{ verified: boolean }>;
  resendOtp: (email: string, purpose: string) => Promise<void>;
  
  // OAuth
  googleAuth: (googleToken: string) => Promise<void>;
  
  // Super Admin
  transferOwnership: (data: {
    new_super_admin_email: string;
    current_admin_otp: string;
    new_admin_otp: string;
  }) => Promise<void>;
  
  // Utilities
  refreshUser: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  isSuperAdmin: () => boolean;
  isContractor: () => boolean;
  isUser: () => boolean;
  getRedirectPath: () => string;
}

// ============================= CONTEXT =============================

const AuthContext = createContext<AuthContextType | null>(null);

// ============================= PROVIDER =============================

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,
  });
  
  const { toast } = useToast();
  
  // ============================= INITIALIZATION =============================
  
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const user = await authService.refreshUser();
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
          });
        } else {
          setState(prev => ({
            ...prev,
            isInitialized: true,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        authService.clearUserData();
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });
      }
    };
    
    initializeAuth();
  }, []);
  
  // ============================= AUTH METHODS =============================
  
  const login = useCallback(async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await authService.login({ email, password });
      
      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
      });
      
      toast({
        title: 'Welcome back!',
        description: `Logged in as ${response.user.full_name}`,
      });
      
      // Redirect based on role
      const redirectPath = authService.getRedirectPath(response.user.role);
      window.location.href = redirectPath;
      
    } catch (error: unknown) {
      const err = error as ErrorType;
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: 'Login Failed',
        description: err.message,
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);
  
  const registerUser = useCallback(async (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await authService.registerUser({
        ...userData,
        user_type: 'USER',
      });
      
      setState(prev => ({ ...prev, isLoading: false }));
      
      toast({
        title: 'Registration Successful!',
        description: response.message || 'Please check your email to verify your account.',
      });
      
    } catch (error: unknown) {
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: 'Registration Failed',
        description: (error as ErrorType).message,
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);
  
  const registerContractor = useCallback(async (contractorData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    company_name: string;
    business_license: string;
    expertise_areas: string[];
    location: string;
    description: string;
  }) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await authService.registerContractor({
        ...contractorData,
        user_type: 'CONTRACTOR',
      });
      
      setState(prev => ({ ...prev, isLoading: false }));
      
      toast({
        title: 'Contractor Registration Submitted!',
        description: response.message || 'Your application is under review. You will be notified once approved.',
      });
      
    } catch (error: unknown) {
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: 'Registration Failed',
        description: (error as ErrorType).message,
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);
  
  const logout = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      await authService.logout();
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });
      
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      
      // Redirect to home or login
      window.location.href = '/login';
      
    } catch (error: unknown) {
      const err = error as ErrorType;
      setState(prev => ({ ...prev, isLoading: false }));
      console.error('Logout error:', error);
      // Force logout even if API fails
      authService.clearUserData();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });
      window.location.href = '/login';
    }
  }, [toast]);
  
  // ============================= PASSWORD MANAGEMENT =============================
  
  const forgotPassword = useCallback(async (email: string) => {
    try {
      const response = await authService.forgotPassword(email);
      toast({
        title: 'Password Reset Email Sent',
        description: response.message || 'Check your email for password reset instructions.',
      });
    } catch (error: unknown) {
      const err = error as ErrorType;
      toast({
        title: 'Password Reset Failed',
        description: err.message,
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);
  
  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    try {
      const response = await authService.resetPassword({ token, new_password: newPassword });
      toast({
        title: 'Password Reset Successful',
        description: response.message || 'Your password has been reset. You can now login with your new password.',
      });
    } catch (error: unknown) {
      const err = error as ErrorType;
      toast({
        title: 'Password Reset Failed',
        description: err.message,
        variant: 'descriptive',
      });
      throw error;
    }
  }, [toast]);
  
  // ============================= OTP & VERIFICATION =============================
  
  const verifyOtp = useCallback(async (email: string, otp: string, purpose: string) => {
    try {
      const response = await authService.verifyOtp({
        email,
        otp,
        purpose,
      });
      
      if (response.verified) {
        toast({
          title: 'Verification Successful',
          description: response.message || 'Your OTP has been verified.',
        });
      }
      
      return response;
    } catch (error: unknown) {
      toast({
        title: 'Verification Failed',
        description: (error as ErrorType).message,
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);
  
  const resendOtp = useCallback(async (email: string, purpose: string) => {
    try {
      const response = await authService.resendOtp(email, purpose);
      toast({
        title: 'OTP Sent',
        description: response.message || 'A new OTP has been sent to your email.',
      });
    } catch (error: unknown) {
      toast({
        title: 'Failed to Send OTP',
        description: (error as ErrorType).message,
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);
  
  // ============================= OAUTH =============================
  
  const googleAuth = useCallback(async (googleToken: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await authService.googleAuth(googleToken);
      
      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
      });
      
      toast({
        title: 'Google Login Successful!',
        description: `Welcome, ${response.user.full_name}`,
      });
      
      // Redirect based on role
      const redirectPath = authService.getRedirectPath(response.user.role);
      window.location.href = redirectPath;
      
    } catch (error: unknown) {
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: 'Google Login Failed',
        description: (error as ErrorType).message,
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);
  
  // ============================= SUPER ADMIN =============================
  
  const transferOwnership = useCallback(async (data: {
    new_super_admin_email: string;
    current_admin_otp: string;
    new_admin_otp: string;
  }) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await authService.transferOwnership(data);
      
      toast({
        title: 'Ownership Transfer Successful',
        description: response.message || 'Super Admin ownership has been transferred.',
      });
      
      // Force logout as the current user is no longer super admin
      await logout();
      
    } catch (error: unknown) {
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: 'Ownership Transfer Failed',
        description: (error as ErrorType).message,
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast, logout]);
  
  // ============================= UTILITIES =============================
  
  const refreshUser = useCallback(async () => {
    try {
      const user = await authService.refreshUser();
      setState(prev => ({ ...prev, user }));
    } catch (error: unknown) {
      console.error('Failed to refresh user:', error);
      await logout();
    }
  }, [logout]);
  
  const hasRole = useCallback((role: UserRole): boolean => {
    return state.user?.role === role;
  }, [state.user]);
  
  const isSuperAdmin = useCallback((): boolean => {
    return hasRole('SUPER_ADMIN');
  }, [hasRole]);
  
  const isContractor = useCallback((): boolean => {
    return hasRole('CONTRACTOR');
  }, [hasRole]);
  
  const isUser = useCallback((): boolean => {
    return hasRole('USER');
  }, [hasRole]);
  
  const getRedirectPath = useCallback((): string => {
    return authService.getRedirectPath(state.user?.role);
  }, [state.user]);
  
  // ============================= CONTEXT VALUE =============================
  
  const contextValue: AuthContextType = {
    ...state,
    login,
    registerUser,
    registerContractor,
    logout,
    forgotPassword,
    resetPassword,
    verifyOtp,
    resendOtp,
    googleAuth,
    transferOwnership,
    refreshUser,
    hasRole,
    isSuperAdmin,
    isContractor,
    isUser,
    getRedirectPath,
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================= HOOK =============================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ============================= PROTECTED ROUTE COMPONENT =============================

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: UserRole[];
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  roles = [], 
  fallback = <div>Access Denied</div> 
}) => {
  const { user, isAuthenticated, isLoading, isInitialized } = useAuth();
  
  // Show loading while initializing
  if (!isInitialized || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    window.location.href = '/login';
    return null;
  }
  
  // Check role permissions
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};
