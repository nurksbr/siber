'use client';

import { useState, useEffect } from 'react';
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

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTab>('info');
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push('/giris');
      return;
    }

    // Fetch profile data
    if (user) {
      fetchProfileData();
    }
  }, [user, loading, router]);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/profile/${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
      } else {
        console.error('Profil bilgileri alınamadı');
      }
    } catch (error) {
      console.error('Profil bilgileri alınırken hata oluştu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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