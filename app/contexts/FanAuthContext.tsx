'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
const TOKEN_KEY = 'mizukiprism_auth_token';

export interface FanUser {
  id: string;
  email: string;
}

interface FanAuthContextType {
  user: FanUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  requestOtp: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
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

export function buildAuthHeaders(token: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export const FanAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FanUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setUser(null);
        return;
      }
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const requestOtp = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        return { success: true };
      }
      if (res.status === 429) {
        return { success: false, error: '請求過於頻繁，請 15 分鐘後再試' };
      }
      return { success: false, error: '驗證碼發送失敗，請稍後再試' };
    } catch {
      return { success: false, error: '驗證碼發送失敗，請稍後再試' };
    }
  };

  const verifyOtp = async (email: string, code: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(TOKEN_KEY, data.token);
        setUser(data.user);
        return { success: true };
      }
      if (res.status === 400) {
        const data = await res.json();
        if (data.error === 'INVALID_CODE') {
          return {
            success: false,
            error: `驗證碼錯誤，剩餘 ${data.remainingAttempts} 次嘗試機會`,
          };
        }
        if (data.error === 'EXPIRED' || data.error === 'MAX_ATTEMPTS') {
          return { success: false, error: '驗證碼已失效，請重新取得' };
        }
      }
      return { success: false, error: '驗證失敗，請稍後再試' };
    } catch {
      return { success: false, error: '驗證失敗，請稍後再試' };
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        await fetch(`${API_BASE}/api/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    }
  };

  return (
    <FanAuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoading,
        requestOtp,
        verifyOtp,
        logout,
        checkAuth,
      }}
    >
      {children}
    </FanAuthContext.Provider>
  );
};
