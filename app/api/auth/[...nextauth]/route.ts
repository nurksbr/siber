import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Kullanıcı oturumunu kontrol etme işlevi
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Oturum açılmamış' },
        { status: 401 }
      );
    }
    
    // Token doğrulama
    const decoded = verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    return NextResponse.json(
      { authenticated: true, user: decoded },
      { status: 200 }
    );
  } catch (error) {
    console.error('Oturum doğrulama hatası:', error);
    return NextResponse.json(
      { error: 'Geçersiz veya süresi dolmuş oturum' },
      { status: 401 }
    );
  }
}

// Çıkış yapma işlevi
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Cookie'yi sil
    cookieStore.delete('auth-token');
    
    return NextResponse.json(
      { message: 'Başarıyla çıkış yapıldı' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Çıkış hatası:', error);
    return NextResponse.json(
      { error: 'Çıkış yapılırken bir hata oluştu' },
      { status: 500 }
    );
  }
}