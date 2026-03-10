import { useState, useEffect, useCallback } from 'react';

interface User {
  id: number;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const API_BASE = 'http://localhost:8000';

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Load token from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('ghost_token');
    const userStr = localStorage.getItem('ghost_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setState({ user, token, isAuthenticated: true, isLoading: false });
      } catch {
        localStorage.removeItem('ghost_token');
        localStorage.removeItem('ghost_user');
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Signup failed');

    localStorage.setItem('ghost_token', data.token);
    localStorage.setItem('ghost_user', JSON.stringify(data.user));
    setState({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
    return data;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Login failed');

    localStorage.setItem('ghost_token', data.token);
    localStorage.setItem('ghost_user', JSON.stringify(data.user));
    setState({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ghost_token');
    localStorage.removeItem('ghost_user');
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
  }, []);

  return { ...state, signup, login, logout };
}
