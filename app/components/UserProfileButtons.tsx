'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import { FaUserShield, FaGraduationCap } from 'react-icons/fa'

export function UserProfileButtons() {
  const { user, loading } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  // İstemci tarafında olduğumuzu belirtelim
  useEffect(() => {
    setMounted(true);
    
    // LocalStorage kontrolü
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('cyberly_user');
        if (storedUser) {
          console.log('UserProfileButtons: Kullanıcı localStorage\'da bulundu');
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('UserProfileButtons: LocalStorage hatası', error);
      }
    }
  }, []);

  // Auth hook'undaki kullanıcı değişikliklerini izle
  useEffect(() => {
    if (user) {
      console.log('UserProfileButtons: Auth hook kullanıcı değişikliği', user);
      setIsLoggedIn(true);
    }
  }, [user]);

  // Eğer client tarafında değilsek veya kullanıcı giriş yapmamışsa null döndür
  if (!mounted || !isLoggedIn) {
    return null;
  }

  // Kullanıcı giriş yapmışsa butonları göster (artık hem mobil hem masaüstünde görünecek)
  return (
    <div className="bg-gray-800/80 backdrop-blur-sm py-3 px-4 border-t border-b border-gray-700">
      <div className="container mx-auto">
        <div className="flex flex-wrap justify-center md:justify-end space-x-4">
          <Link 
            href="/profil" 
            className="px-4 py-2 bg-cyan-600/80 text-white rounded-md text-sm font-medium hover:bg-cyan-700 transition-colors flex items-center"
          >
            <FaUserShield className="h-5 w-5 mr-2" />
            Profil
          </Link>
          <Link 
            href="/egitimlerim" 
            className="px-4 py-2 bg-gray-700/80 text-white rounded-md text-sm font-medium hover:bg-gray-600 transition-colors flex items-center"
          >
            <FaGraduationCap className="h-5 w-5 mr-2" />
            Eğitimlerim
          </Link>
        </div>
      </div>
    </div>
  );
} 