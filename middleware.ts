import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

// Korumalı rotalar
const protectedRoutes = [
  '/profil',
  '/egitimler',
  '/panel',
];

// Kimlik doğrulama gerektirmeyen rotalar
const publicRoutes = [
  '/',
  '/giris',
  '/uye-ol',
  '/hakkimizda',
  '/blog',
  '/siber-tehditler',
  '/haberler',
  '/ipuclari',
  '/kaynaklar',
  '/sss',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // API rotaları için özel işlem
  if (pathname.startsWith('/api/')) {
    // Auth API'leri hariç diğer API'ler için token kontrolü
    if (!pathname.startsWith('/api/auth/')) {
      return validateTokenForApi(request);
    }
    return NextResponse.next();
  }
  
  // Korumalı sayfa rotaları için token kontrolü
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      // Token yoksa giriş sayfasına yönlendir
      const url = new URL('/giris', request.url);
      url.searchParams.set('callbackUrl', encodeURI(pathname));
      return NextResponse.redirect(url);
    }
    
    try {
      // Token doğrulama
      verify(token, process.env.JWT_SECRET || 'fallback_secret');
      return NextResponse.next();
    } catch (error) {
      // Geçersiz token, giriş sayfasına yönlendir
      const url = new URL('/giris', request.url);
      url.searchParams.set('callbackUrl', encodeURI(pathname));
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

// API istekleri için token doğrulama
function validateTokenForApi(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    return NextResponse.json(
      { error: 'Yetkilendirme hatası: Token bulunamadı' },
      { status: 401 }
    );
  }
  
  try {
    // Token doğrulama
    verify(token, process.env.JWT_SECRET || 'fallback_secret');
    return NextResponse.next();
  } catch (error) {
    return NextResponse.json(
      { error: 'Yetkilendirme hatası: Geçersiz token' },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.svg).*)',
  ],
};