'use client'

import React from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import BlogCards from './components/BlogCards'
import CTA from './components/CTA'
import Footer from './components/Footer'
import MatrixRain from './components/MatrixRain'
// Geçici olarak bileşenin path'ini ve ismini kontrol edelim
import { UserProfileButtons } from './components/UserProfileButtons'

export default function Home() {
  return (
    <div className="relative min-h-screen bg-gray-900">
      <MatrixRain />
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          
          {/* Kullanıcı profil butonları - Daha görünür pozisyonda */}
          <div className="mb-4">
            <UserProfileButtons />
          </div>
          
          <Features />
          <BlogCards />
          <CTA />
        </main>
        <Footer />
      </div>
    </div>
  )
}
