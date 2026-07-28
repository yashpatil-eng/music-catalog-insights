'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredEmail, setStoredEmail, setToken } from './api';

interface AuthContextValue {
  email: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setEmail(getStoredEmail());
    setIsLoading(false);
  }, []);

  function login(token: string, userEmail: string) {
    setToken(token);
    setStoredEmail(userEmail);
    setEmail(userEmail);
  }

  function logout() {
    setToken(null);
    setStoredEmail(null);
    setEmail(null);
    router.push('/login');
  }

  return (
    <AuthContext.Provider value={{ email, isAuthenticated: !!email, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
