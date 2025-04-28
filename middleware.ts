import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Middleware'in çalışacağı korumalı rotalar
export const config = {
  matcher: [
    // Sadece korumalı sayfalar için çalıştır
    '/profil/:path*',
    '/egitimler/:path*',
    '/panel/:path*',
    '/ayarlar/:path*',
  ],
};

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const url = request.nextUrl.clone();
  const { pathname } = url;
  
  // Geçerli URL'i callback için kullan
  const callbackUrl = encodeURIComponent(url.pathname + url.search);
  
  // Token geçerli mi kontrol et
  const isValidUserToken = token ? await isValidToken(token) : false;
  
  // Hata ayıklama için token durumunu logla
  console.log(`Korumalı sayfa kontrolü - Yol: ${pathname}, Token geçerli: ${isValidUserToken}`);

  // Korumalı sayfalara erişim için token gerekli
  if (!isValidUserToken) {
    console.log(`Korumalı rota erişimi engellendi. Şuraya yönlendiriliyor: /giris?callbackUrl=${callbackUrl}`);
    return NextResponse.redirect(new URL(`/giris?callbackUrl=${callbackUrl}`, request.url));
  }

  // Token geçerliyse erişime izin ver
  return NextResponse.next();
}

// Token doğrulama fonksiyonu - artık asenkron
async function isValidToken(token: string): Promise<boolean> {
  try {
    // Edge runtime ile uyumlu jose kütüphanesi kullanıyoruz
    const secret = process.env.JWT_SECRET || 'default_secret_should_be_changed';
    const secretBytes = new TextEncoder().encode(secret);
    
    // Asenkron olarak token doğrulama
    await jwtVerify(token, secretBytes);
    return true;
  } catch (error) {
    console.error('Token doğrulama hatası:', error);
    return false;
  }
}