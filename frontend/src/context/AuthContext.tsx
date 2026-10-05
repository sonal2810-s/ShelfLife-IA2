import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin } from '../api/auth';
import type { LoginResponse } from '../types';

interface AuthUser {
  role: string;
  email: string;
}

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * State Management Rationale (IA2 Exam Requirement):
 * Local React state is sufficient for page-specific API data and form state.
 * Authentication is kept in Context so the token and logged-in user can be
 * shared across protected routes without introducing unnecessary global
 * state-management complexity (such as Redux).
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Restore authentication state from localStorage on application mount
    const savedToken = localStorage.getItem('shelflife_token');
    const savedUser = localStorage.getItem('shelflife_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('shelflife_token');
        localStorage.removeItem('shelflife_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    const res = await apiLogin(email, password);
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('shelflife_token', res.token);
      localStorage.setItem('shelflife_user', JSON.stringify(res.user));
    }
    return res;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('shelflife_token');
    localStorage.removeItem('shelflife_user');
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
