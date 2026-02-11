'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { showSuccessToast, showErrorToast, showWarningToast } from '@/hooks/use-toast';

interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  role: 'ADMIN' | 'BRANCH_MANAGER' | 'CASHIER';
  branchId?: string;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for sending cookies
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        showErrorToast('Login Failed', data.error || 'Invalid credentials');
        setError(data.error || 'Login failed');
        return;
      }

      // Set user from session response
      setUser({
        id: data.session.userId,
        username: data.session.username,
        email: data.session.email,
        name: data.session.name,
        role: data.session.role,
        branchId: data.session.branchId,
        isActive: true,
      });
      showSuccessToast('Welcome back!', `Logged in as ${data.session.name || data.session.username}`);
    } catch (err) {
      showErrorToast('Network Error', 'Failed to connect. Please try again.');
      console.error('Login error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      // Call logout API to clear secure session cookie
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for sending cookies
      }).then(async (response) => {
        const data = await response.json();
        if (data.success) {
          setUser(null);
          showSuccessToast('Logged out successfully');
        }
      }).catch(err => {
        console.error('Logout error:', err);
        setUser(null);
      });

      // Clear any legacy localStorage data
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
    } catch (err) {
      console.error('Logout error:', err);
      setUser(null);
    }
  };

  // Check for existing session on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // First check localStorage for legacy data (backward compatibility)
      const storedUser = localStorage.getItem('user');
      const isLoggedIn = localStorage.getItem('isLoggedIn');

      if (storedUser && isLoggedIn === 'true') {
        try {
          setUser(JSON.parse(storedUser));
        } catch (err) {
          console.error('Failed to parse stored user:', err);
          localStorage.removeItem('user');
        }
      }

      // Then verify session with server (secure cookie validation)
      fetch('/api/auth/session', {
        credentials: 'include',
      })
        .then(async (response) => {
          const data = await response.json();
          if (data.success && data.user) {
            setUser(data.user);
            // Clear legacy localStorage after successful session validation
            localStorage.removeItem('user');
            localStorage.removeItem('isLoggedIn');
          }
        })
        .catch(err => {
          console.error('Session validation error:', err);
        });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, error }}>
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
