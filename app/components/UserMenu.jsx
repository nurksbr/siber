'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function UserMenu() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await logout();
      // Çıkış yapıldıktan sonra ana sayfaya yönlendir
      window.location.href = '/';
    } catch (error) {
      console.error('Çıkış yapılırken hata:', error);
      alert('Çıkış yaparken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleNavigation = (path) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeMenu();
    router.push(path);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  // Kullanıcı avatarı için baş harflerini al
  const getUserInitials = () => {
    if (user?.name) {
      // İsmin ilk harfi
      return user.name.charAt(0).toUpperCase();
    } else if (user?.email) {
      // E-postanın ilk harfi
      return user.email.charAt(0).toUpperCase();
    }
    return '?';
  };

  if (!user) {
    return null;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleMenu}
        className="flex items-center rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="sr-only">Kullanıcı menüsünü aç</span>
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-cyan-600 flex items-center justify-center text-white font-medium">
            {getUserInitials()}
          </div>
          <span className="ml-2 mr-2 text-sm text-gray-200 hidden sm:block">
            {user.name || user.email.split('@')[0]}
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <>
          {/* Overlay to capture clicks outside menu */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={closeMenu}
            aria-hidden="true"
          />
        
          {/* Dropdown menu */}
          <div 
            className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-20 divide-y divide-gray-700"
          >
            {/* Kullanıcı bilgileri */}
            <div className="px-4 py-3">
              <p className="text-sm text-gray-300">Giriş yapan kullanıcı</p>
              <p className="text-sm font-medium text-white truncate">{user.email}</p>
              {user.role === 'ADMIN' && (
                <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-cyan-800 text-cyan-100">
                  Yönetici
                </span>
              )}
            </div>
            
            {/* Menü öğeleri */}
            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button">
              <button
                className="group flex items-center w-full text-left px-4 py-2 text-sm text-gray-100 hover:bg-gray-700"
                onClick={handleNavigation('/profil')}
                role="menuitem"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400 group-hover:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profil
              </button>
              
              <button
                className="group flex items-center w-full text-left px-4 py-2 text-sm text-gray-100 hover:bg-gray-700"
                onClick={handleNavigation('/egitimlerim')}
                role="menuitem"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400 group-hover:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Eğitimlerim
              </button>
              
              <button
                className="group flex items-center w-full text-left px-4 py-2 text-sm text-gray-100 hover:bg-gray-700"
                onClick={handleNavigation('/ayarlar')}
                role="menuitem"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400 group-hover:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Ayarlar
              </button>
              
              <button
                className="group flex items-center w-full text-left px-4 py-2 text-sm text-gray-100 hover:bg-gray-700"
                onClick={handleNavigation('/bildirimler')}
                role="menuitem"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400 group-hover:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Bildirimler
              </button>
            </div>
            
            {/* Admin menüsü */}
            {user.role === 'ADMIN' && (
              <div className="py-1">
                <button
                  className="group flex items-center w-full text-left px-4 py-2 text-sm text-gray-100 hover:bg-gray-700"
                  onClick={handleNavigation('/panel')}
                  role="menuitem"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400 group-hover:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Yönetim Paneli
                </button>
              </div>
            )}
            
            {/* Çıkış */}
            <div className="py-1">
              <button
                className="group flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                onClick={handleLogout}
                role="menuitem"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Çıkış Yap
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 