import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredEmail, setStoredEmail, setToken } from './api';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [email, setEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setEmail(getStoredEmail());
    setIsLoading(false);
  }, []);

  function login(token, userEmail) {
    setToken(token);
    setStoredEmail(userEmail);
    setEmail(userEmail);
  }

  function logout() {
    setToken(null);
    setStoredEmail(null);
    setEmail(null);
    navigate('/login');
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
