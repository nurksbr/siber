'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

// Kullanıcı tipi
export type User = {
  id: string;
  email: string;
  name: string;
  role: string;
};

// Auth context tipleri
export type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cookie alıcı (istemci tarafında çalışır)
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const part = parts.pop();
    if (part) {
      return part.split(';').shift() || null;
    }
  }
  return null;
};

// JWT token çözümleyici
const parseJwt = (token: string) => {
  try {
    return jwtDecode<{
      userId: string;
      email: string;
      role: string;
      exp: number;
    }>(token);
  } catch (e) {
    console.error('Token çözümleme hatası:', e);
    return null;
  }
};

// Token geçerli mi kontrol et
const isTokenValid = (token: string): boolean => {
  const decoded = parseJwt(token);
  if (!decoded) return false;
  
  // Süre kontrolü
  const currentTime = Date.now() / 1000;
  return decoded.exp > currentTime;
};

// AuthProvider bileşeni
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Sayfa yüklendiğinde oturum durumunu kontrol et
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const isAuthenticated = await checkAuth();
        
        // Callback URL'i kontrol et
        const callbackUrl = searchParams?.get('callbackUrl');
        
        // Kullanıcı giriş yapmış ve bir callback URL varsa, pathname'e bakmaksızın yönlendir
        if (isAuthenticated && callbackUrl) {
          console.log(`Callback URL'e yönlendiriliyor: ${callbackUrl}`);
          window.location.href = decodeURIComponent(callbackUrl);
        }
      } catch (error) {
        console.error('Oturum kontrolü hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserSession();
  }, [searchParams, router]);

  // Kullanıcı oturumunu kontrol et
  const checkAuth = async (): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Önce istemci tarafında cookie kontrolü yap
      const token = getCookie('auth_token');
      
      if (!token) {
        console.log('Cookie bulunamadı: auth_token');
        setUser(null);
        return false;
      }
      
      // Token geçerliliğini istemci tarafında kontrol et
      if (!isTokenValid(token)) {
        console.log('Token geçerli değil veya süresi dolmuş');
        setUser(null);
        return false;
      }
      
      console.log('İstemci tarafında token doğrulandı, sunucu kontrolüne geçiliyor');
      
      // İstemci tarafında token geçerli, sunucu doğrulamasına git
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-store',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          console.log('Sunucu tarafında kullanıcı doğrulandı:', data.user.email);
          setUser(data.user);
          return true;
        }
      } else {
        console.log('Sunucu tarafında oturum doğrulanamadı');
      }
      
      setUser(null);
      return false;
    } catch (error) {
      console.error('Oturum kontrolü hatası:', error);
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Giriş fonksiyonu
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

      // Kullanıcı bilgilerini doğrudan yanıttan al
      if (data.user) {
        setUser(data.user);
        
        // Callback URL varsa doğrudan yönlendir, yoksa profil sayfasına
        const callbackUrl = searchParams?.get('callbackUrl');
        if (callbackUrl) {
          console.log(`Callback URL'e yönlendiriliyor: ${callbackUrl}`);
          window.location.href = decodeURIComponent(callbackUrl);
        } else {
          // Doğrudan profil sayfasına yönlendir
          console.log('Kullanıcı giriş yaptı, profil sayfasına yönlendiriliyor');
          window.location.href = '/profil';
        }
      } else {
        // Oturum durumunu kontrol et
        await checkAuth();
      }
    } finally {
      setLoading(false);
    }
  };

  // Çıkış işlemi
  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Çıkış yapılırken bir hata oluştu');
      }

      setUser(null);
      router.push('/giris');
    } finally {
      setLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

// Auth context hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth hook must be used within an AuthProvider');
  }
  return context;
}