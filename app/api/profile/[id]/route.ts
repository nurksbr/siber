import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import prisma from '@/app/lib/prisma';

// GET /api/profile/[id]
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Auth token'ı al
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }
    
    // Token'ı doğrula
    let decodedToken;
    try {
      decodedToken = verify(token, process.env.JWT_SECRET || 'fallback_secret') as { 
        userId: string;
        role?: string;
      };
    } catch (error) {
      return NextResponse.json({ error: 'Geçersiz veya süresi dolmuş oturum' }, { status: 401 });
    }
    
    // Kullanıcı kimliğini doğrula
    const userId = params.id;
    
    // Kullanıcı kendi profilini istiyor mu veya admin mi kontrol et
    if (decodedToken.userId !== userId && decodedToken.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz bulunmuyor' }, { status: 403 });
    }
    
    // Kullanıcı profilini getir
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        notificationPrefs: true,
      },
    });
    
    // Profil yoksa, varsayılan bir profil oluştur
    if (!profile) {
      const newProfile = await prisma.profile.create({
        data: {
          userId,
          theme: 'LIGHT',
          securityLevel: 'BEGINNER',
          preferredLanguage: 'tr',
          contentPreferences: '', // Boş string olarak ayarla
          interests: '', // Boş string olarak ayarla
          notificationPrefs: {
            create: {
              emailNotifications: true,
              smsNotifications: false,
              securityAlerts: true,
              newsUpdates: true,
              courseUpdates: true,
              marketingEmails: false,
            },
          },
        },
        include: {
          notificationPrefs: true,
        },
      });
      
      return NextResponse.json(newProfile);
    }
    
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Profil bilgileri alınırken hata:', error);
    return NextResponse.json({ error: 'Profil bilgileri alınamadı' }, { status: 500 });
  }
}