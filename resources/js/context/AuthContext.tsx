import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import authApi, { User, AuthResponse } from '../api/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<RegisterResult>;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
}

interface RegisterResult {
  success: boolean;
  errors?: Record<string, string[]>;
  message?: string;
}

interface LoginResult {
  success: boolean;
  message?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(false);

  const saveSession = (userData: User, token: string): void => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setUser(userData);
  };

  const clearSession = useCallback((): void => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
  }, []);

  // Listen for 401 events from the axios interceptor
  useEffect(() => {
    window.addEventListener('auth:logout', clearSession);
    return () => window.removeEventListener('auth:logout', clearSession);
  }, [clearSession]);

  const register = async (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ): Promise<RegisterResult> => {
    setLoading(true);
    try {
      const { data } = await authApi.register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      saveSession(data.data.user, data.data.token);
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        errors: err.response?.data?.errors || {},
        message: err.response?.data?.message || 'Registration failed.',
      };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<LoginResult> => {
    setLoading(true);
    try {
      const { data } = await authApi.login({ email, password });
      saveSession(data.data.user, data.data.token);
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed.',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch {
      // Still clear locally even if API call fails
    } finally {
      clearSession();
    }
  };

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, isAdmin, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};