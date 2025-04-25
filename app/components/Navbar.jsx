'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

// Navigasyon linkleri
const NAV_LINKS = [
  { name: 'Ana Sayfa', path: '/' },
  { name: 'Hakkımızda', path: '/hakkimizda' },
  { name: 'Blog', path: '/blog' },
  { name: 'Siber Tehditler', path: '/siber-tehditler' },
  { name: 'İpuçları', path: '/ipuclari' },
  { name: 'Kaynaklar', path: '/kaynaklar' },
  { name: 'SSS', path: '/sss' },
  { name: 'Haberler', path: '/haberler' }
]

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  // Link prefetching için - sayfa yüklendiğinde en sık ziyaret edilen sayfaları önceden yükle
  useEffect(() => {
    // Yaygın sayfaları preload için link elementleri ekle
    const preloadLinks = ['/hakkimizda', '/blog']
    preloadLinks.forEach(path => {
      if (pathname !== path) {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'fetch'
        link.href = path
        link.crossOrigin = 'anonymous'
        document.head.appendChild(link)
      }
    })
  }, [pathname])

  const scrollToContact = (e) => {
    e.preventDefault()
    const contactSection = document.getElementById('iletisim')
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMenuOpen(false)
  }

  return (
    <nav className="relative bg-gray-900/20 text-white shadow-lg border-b border-cyan-700 backdrop-blur-sm z-[3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="w-8 h-8 mr-2 relative">
                <Image
                  src="/shield-lock.svg"
                  alt="CYBERLY Logo"
                  width={32}
                  height={32}
                  className="text-cyan-500 text-glow"
                  priority
                />
              </div>
              <span className="font-bold text-xl text-cyan-400 text-glow">CYBERLY</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.path
              return (
                <Link 
                  key={link.path}
                  href={link.path} 
                  prefetch={true}
                  className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800/30 hover:text-cyan-400 transition-colors ${
                    isActive ? 'text-cyan-400 bg-gray-800/30' : 'text-white'
                  }`}
                >
                  {link.name}
                </Link>
              )
            })}
            <a 
              href="#iletisim" 
              onClick={scrollToContact}
              className="px-4 py-2 rounded-md text-sm font-medium bg-cyan-600/60 hover:bg-cyan-700 transition-colors border-glow"
            >
              İletişim
            </a>
            <div className="ml-4 flex items-center space-x-2">
              <Link 
                href="/giris" 
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800/30 hover:text-cyan-400 transition-colors"
              >
                Giriş Yap
              </Link>
              <Link 
                href="/uye-ol" 
                className="px-4 py-2 rounded-md text-sm font-medium bg-cyan-500/80 hover:bg-cyan-600 transition-colors"
              >
                Üye Ol
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-cyan-400 hover:text-white hover:bg-gray-800/30 focus:outline-none"
              aria-expanded={isMenuOpen}
              aria-label="Toggle menu"
            >
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div 
        className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden bg-gray-900/20 backdrop-blur-sm`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.path
            return (
              <Link 
                key={link.path}
                href={link.path} 
                prefetch={true}
                className={`block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800/30 hover:text-cyan-400 transition-colors ${
                  isActive ? 'text-cyan-400 bg-gray-800/30' : 'text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            )
          })}
          <a 
            href="#iletisim" 
            onClick={scrollToContact}
            className="block px-3 py-2 rounded-md text-base font-medium bg-cyan-600/60 hover:bg-cyan-700 transition-colors border-glow"
          >
            İletişim
          </a>
          <Link 
            href="/giris" 
            className="block px-3 py-2 mt-2 rounded-md text-base font-medium hover:bg-gray-800/30 hover:text-cyan-400 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Giriş Yap
          </Link>
          <Link 
            href="/uye-ol" 
            className="block px-3 py-2 mt-2 rounded-md text-base font-medium bg-cyan-500/80 hover:bg-cyan-600 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Üye Ol
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 