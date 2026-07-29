import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredEmail, setStoredEmail, getStoredName, setStoredName, setToken } from './api';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [email, setEmail] = useState(null);
  const [name, setName] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setEmail(getStoredEmail());
    setName(getStoredName());
    setIsLoading(false);
  }, []);

  function login(token, userEmail, userName) {
    setToken(token);
    setStoredEmail(userEmail);
    setStoredName(userName);
    setEmail(userEmail);
    setName(userName);
  }

  function logout() {
    setToken(null);
    setStoredEmail(null);
    setStoredName(null);
    setEmail(null);
    setName(null);
    navigate('/login');
  }

  return (
    <AuthContext.Provider value={{ email, name, isAuthenticated: !!email, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
