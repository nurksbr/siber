'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isLoading, setIsLoading] = useState(false)
  const [registerError, setRegisterError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Hata mesajlarını temizle
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Ad Soyad gereklidir'
    }
    
    if (!formData.email) {
      newErrors.email = 'E-posta adresi gereklidir'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz'
    }
    
    if (!formData.password) {
      newErrors.password = 'Şifre gereklidir'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Şifre en az 8 karakter olmalıdır'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(formData.password)) {
      newErrors.password = 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir'
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifrenizi tekrar girin'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor'
    }
    
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'Kullanım şartlarını kabul etmelisiniz'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterError('')
    
    if (!validateForm()) return
    
    setIsLoading(true)
    
    try {
      // API'ye kayıt isteği gönder
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Kayıt işlemi başarısız oldu')
      }
      
      // Başarılı kayıt
      setIsSuccess(true)
      
      // 3 saniye sonra giriş sayfasına yönlendir
      setTimeout(() => {
        router.push('/giris')
      }, 3000)
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Kayıt işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.';
      setRegisterError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sol taraf - Dekoratif tasarım (büyük ekranlarda) */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-cyan-900/20 z-10"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center z-20 p-10">
          <h3 className="text-3xl font-bold text-cyan-300 mb-4">CYBERLY Ailesine Katılın</h3>
          <p className="text-center text-lg text-gray-300 max-w-md mb-8">
            Üye olarak siber güvenlik dünyasındaki en güncel gelişmelere ve özel içeriklere erişim sağlayabilirsiniz.
          </p>
          <div className="grid grid-cols-1 gap-6 max-w-md w-full">
            <div className="flex items-start space-x-4 bg-gray-800/50 border border-cyan-800/50 rounded-lg p-5">
              <div className="bg-cyan-700/30 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h4 className="text-cyan-400 text-lg font-semibold">Güvenli Hesap</h4>
                <p className="text-gray-300 text-sm mt-1">Güçlü parola ve iki faktörlü kimlik doğrulama ile hesabınızı koruyun</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 bg-gray-800/50 border border-cyan-800/50 rounded-lg p-5">
              <div className="bg-cyan-700/30 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h4 className="text-cyan-400 text-lg font-semibold">Uzman İçerikler</h4>
                <p className="text-gray-300 text-sm mt-1">Siber güvenlik uzmanlarımızın hazırladığı özel içeriklere erişin</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 bg-gray-800/50 border border-cyan-800/50 rounded-lg p-5">
              <div className="bg-cyan-700/30 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h4 className="text-cyan-400 text-lg font-semibold">Anlık Bildirimler</h4>
                <p className="text-gray-300 text-sm mt-1">Yeni güvenlik tehditleri ve güncellemeleri hakkında anında bilgi alın</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      </div>
      
      {/* Sağ taraf - Kayıt formu */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => router.push('/')}
              className="text-gray-400 hover:text-cyan-400 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="w-12 h-12 relative">
              <Image
                src="/shield-lock.svg"
                alt="CYBERLY Logo"
                width={48}
                height={48}
                className="text-cyan-500"
                priority
              />
            </div>
          </div>
          <h2 className="mt-2 text-center text-3xl font-bold leading-9 tracking-tight text-cyan-400">
            {isSuccess ? 'Kaydınız Tamamlandı!' : 'Hemen Üye Olun'}
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          {registerError && (
            <div className="mb-4 p-3 bg-red-900/40 border border-red-500 rounded-md text-center text-red-300">
              {registerError}
            </div>
          )}
          
          {isSuccess ? (
            <div className="text-center">
              <div className="mb-4 p-4 bg-green-900/40 border border-green-500 rounded-md">
                <svg className="mx-auto h-12 w-12 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="mt-2 text-green-300">Kaydınız başarıyla tamamlandı!</p>
              </div>
              <p className="text-gray-300">Giriş sayfasına yönlendiriliyorsunuz...</p>
              <Link href="/giris" className="mt-6 inline-block text-cyan-400 hover:text-cyan-300">
                Giriş sayfasına git &rarr;
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-300">
                  Ad Soyad
                </label>
                <div className="mt-2">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`block w-full rounded-md border-0 p-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ${
                      errors.name ? 'ring-red-500' : 'ring-gray-600'
                    } focus:ring-2 focus:ring-inset focus:ring-cyan-500 sm:text-sm sm:leading-6`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-300">
                  E-posta adresi
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full rounded-md border-0 p-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ${
                      errors.email ? 'ring-red-500' : 'ring-gray-600'
                    } focus:ring-2 focus:ring-inset focus:ring-cyan-500 sm:text-sm sm:leading-6`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-300">
                  Şifre
                </label>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full rounded-md border-0 p-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ${
                      errors.password ? 'ring-red-500' : 'ring-gray-600'
                    } focus:ring-2 focus:ring-inset focus:ring-cyan-500 sm:text-sm sm:leading-6`}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-gray-300">
                  Şifre Tekrar
                </label>
                <div className="mt-2">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`block w-full rounded-md border-0 p-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ${
                      errors.confirmPassword ? 'ring-red-500' : 'ring-gray-600'
                    } focus:ring-2 focus:ring-inset focus:ring-cyan-500 sm:text-sm sm:leading-6`}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="agreeTerms"
                    name="agreeTerms"
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-cyan-600 focus:ring-cyan-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="agreeTerms" className="text-gray-300">
                    <Link href="/kullanim-sartlari" className="text-cyan-400 hover:text-cyan-300">Kullanım şartlarını</Link> ve <Link href="/gizlilik-politikasi" className="text-cyan-400 hover:text-cyan-300">gizlilik politikasını</Link> kabul ediyorum
                  </label>
                  {errors.agreeTerms && (
                    <p className="mt-1 text-sm text-red-400">{errors.agreeTerms}</p>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex w-full justify-center rounded-md bg-cyan-600 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 ${
                    isLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Kaydınız oluşturuluyor...' : 'Üye Ol'}
                </button>
              </div>
            </form>
          )}

          <p className="mt-10 text-center text-sm text-gray-400">
            Zaten üye misiniz?{' '}
            <Link href="/giris" className="font-semibold leading-6 text-cyan-400 hover:text-cyan-300">
              Giriş yapın
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}