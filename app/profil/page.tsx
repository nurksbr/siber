'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Image from 'next/image';

// Profile sections
import ProfileInfo from '../components/profile/ProfileInfo';
import SecuritySettings from '../components/profile/SecuritySettings';
import NotificationSettings from '../components/profile/NotificationSettings';
import AppearanceSettings from '../components/profile/AppearanceSettings';
import ProgressTracking from '../components/profile/ProgressTracking';

type ProfileTab = 'info' | 'security' | 'notifications' | 'appearance' | 'progress';

// Profil verisi için tip tanımı
interface ProfileData {
  id: string;
  name?: string;
  email: string;
  avatarUrl?: string;
  theme?: string;
  notificationSettings?: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
  securitySettings?: {
    twoFactorEnabled: boolean;
    lastPasswordChange?: string;
  };
  progressData?: {
    completedCourses?: number;
    certificates?: string[];
    level?: number;
  };
  // Diğer özellikler için isteğe bağlı alanlar
  biography?: string;
  jobTitle?: string;
  location?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  settings?: Record<string, boolean | string | number>;
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTab>('info');
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Tarayıcıda localStorage'dan direkt kullanıcı durumunu kontrol et
  const checkLocalStorage = () => {
    if (typeof window === 'undefined') return false;
    
    try {
      const storedUser = localStorage.getItem('cyberly_user');
      return !!storedUser; // Boolean olarak dönüş
    } catch (error) {
      console.error('Profil: LocalStorage kontrol hatası', error);
      return false;
    }
  };

  const fetchProfileData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!user?.id) {
        console.error('Kullanıcı ID bulunamadı');
        return;
      }
      
      console.log(`Profil verisi çekiliyor: /api/profile/${user.id}`);
      
      const response = await fetch(`/api/profile/${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-store',
      });
      
      console.log('API yanıtı alındı:', response.status);
      
      if (response.ok) {
        try {
          const data = await response.json();
          console.log('Profil verisi başarıyla alındı:', data);
          setProfileData(data);
        } catch (error) {
          console.error('API yanıtı JSON formatında değil:', error);
          setError('Profil verisi işlenirken bir hata oluştu');
        }
      } else {
        try {
          const errorText = await response.text();
          console.error(`Profil API hatası (${response.status}):`, errorText);
          
          try {
            const errorData = JSON.parse(errorText);
            console.error('Profil bilgileri alınamadı:', errorData);
            setError(errorData.error || `Profil verisi alınamadı (${response.status})`);
          } catch (jsonError) {
            console.error('Hata yanıtı JSON formatında değil:', errorText);
            setError(`Profil verisi alınamadı. Durum kodu: ${response.status}`);
          }
        } catch (textError) {
          console.error('Hata yanıtı alınamadı:', textError);
          setError(`Profil verisi alınamadı. Durum kodu: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Profil bilgileri alınırken hata oluştu:', error);
      setError('Profil bilgilerinize erişilirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.');
      setProfileData(null); // Hata durumunda profil verisini temizle
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    // Kullanıcı ve localStorage kontrolü
    const hasLocalUser = checkLocalStorage();
    
    // Redirect if not logged in
    if (!loading && !user && !hasLocalUser) {
      console.log('Kullanıcı giriş yapmamış, giriş sayfasına yönlendiriliyor');
      // router.push yerine window.location.href kullanarak tam sayfa yenilenmesi sağla
      window.location.href = '/giris?callbackUrl=' + encodeURIComponent('/profil');
      return;
    }

    // Fetch profile data
    if (user) {
      console.log('Kullanıcı giriş yapmış, profil verisi çekiliyor', user);
      fetchProfileData();
    } else if (hasLocalUser) {
      console.log('LocalStorage\'da kullanıcı bilgisi var, profil verisi çekmeye çalışılıyor');
      fetchProfileData();
    }
  }, [user, loading, router, fetchProfileData]);

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Hata durumunda göster
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">Profil Bilgileri Yüklenemedi</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <button 
              onClick={() => fetchProfileData()}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Profil Yönetimi</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-1/4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-24 h-24 mb-4">
                {profileData?.avatarUrl ? (
                  <Image 
                    src={profileData.avatarUrl} 
                    alt="Profil fotoğrafı" 
                    fill 
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-2xl text-blue-500">
                    {user?.name?.charAt(0) || user?.email.charAt(0)}
                  </div>
                )}
              </div>
              <h2 className="text-xl font-semibold">{user?.name || 'Kullanıcı'}</h2>
              <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
            
            <nav>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => setActiveTab('info')} 
                    className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'info' ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    Kişisel Bilgiler
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('security')} 
                    className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'security' ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    Güvenlik Ayarları
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('notifications')} 
                    className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'notifications' ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    Bildirim Tercihleri
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('appearance')} 
                    className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'appearance' ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    Görünüm Ayarları
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('progress')} 
                    className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'progress' ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    İlerleme ve Başarılar
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        
        {/* Main content */}
        <div className="w-full md:w-3/4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            {activeTab === 'info' && <ProfileInfo profileData={profileData} onUpdate={fetchProfileData} />}
            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === 'notifications' && <NotificationSettings profileData={profileData} onUpdate={fetchProfileData} />}
            {activeTab === 'appearance' && <AppearanceSettings profileData={profileData} onUpdate={fetchProfileData} />}
            {activeTab === 'progress' && <ProgressTracking userId={user?.id} />}
          </div>
        </div>
      </div>
    </div>
  );
}