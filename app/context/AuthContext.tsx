'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  id: string;
  email: string;
  name?: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Sayfa yüklendiğinde oturum durumunu kontrol et
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error('Oturum kontrolü hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserSession();
  }, []);

  // Kullanıcı oturumunu kontrol et
  const checkAuth = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/[...nextauth]', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return true;
      } else {
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('Oturum kontrolü hatası:', error);
      setUser(null);
      return false;
    }
  };

  // Giriş işlemi
  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Giriş yapılırken bir hata oluştu');
      }

      await checkAuth();
    } finally {
      setLoading(false);
    }
  };

  // Kayıt işlemi
  const register = async (name: string, email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kayıt işlemi sırasında bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  // Çıkış işlemi
  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/[...nextauth]', {
        method: 'DELETE',
      });

      if (response.ok) {
        setUser(null);
        router.push('/');
      } else {
        throw new Error('Çıkış yapılırken bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
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