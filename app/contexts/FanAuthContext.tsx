'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface FanUser {
  id: string;
  username: string;
}

interface FanAuthContextType {
  user: FanUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const FanAuthContext = createContext<FanAuthContextType | undefined>(undefined);

export const useFanAuth = () => {
  const context = useContext(FanAuthContext);
  if (!context) {
    throw new Error('useFanAuth must be used within a FanAuthProvider');
  }
  return context;
};

export const FanAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FanUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/fan/check');
      const data = await res.json();
      if (data.loggedIn && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/auth/fan/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || '登入失敗' };
    } catch {
      return { success: false, error: '登入失敗，請稍後再試' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/fan/logout', { method: 'POST' });
    } finally {
      setUser(null);
    }
  };

  return (
    <FanAuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </FanAuthContext.Provider>
  );
};
