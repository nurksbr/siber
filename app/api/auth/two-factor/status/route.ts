import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verify } from 'jsonwebtoken';

const prisma = new PrismaClient();

// Kullanıcı kimlik doğrulama işlevi
async function authenticateUser(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    return null;
  }
  
  try {
    const decoded = verify(token, process.env.JWT_SECRET || 'fallback_secret') as { id: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

// 2FA durum kontrolü API endpoint'i
export async function GET(request: NextRequest) {
  try {
    // Kullanıcı kimlik doğrulama
    const decodedToken = await authenticateUser(request);
    if (!decodedToken) {
      return NextResponse.json(
        { error: 'Kimlik doğrulama gerekli' },
        { status: 401 }
      );
    }

    // URL'den userId parametresini al
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Kullanıcı ID'si verilmediyse token'dan al
    const targetUserId = userId || decodedToken.id;

    // Yetki kontrolü - Başka bir kullanıcının 2FA durumunu kontrol etmeye çalışıyorsa
    if (userId && userId !== decodedToken.id) {
      // Admin değilse hata döndür
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmamaktadır' },
        { status: 403 }
      );
    }

    // Kullanıcıyı bul ve 2FA durumunu kontrol et
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { twoFactorEnabled: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { twoFactorEnabled: user.twoFactorEnabled },
      { status: 200 }
    );
  } catch (error) {
    console.error('2FA durum kontrolü hatası:', error);
    return NextResponse.json(
      { error: '2FA durumu kontrol edilirken bir hata oluştu' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 