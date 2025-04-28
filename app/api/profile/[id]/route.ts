import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import prisma from '@/app/lib/prisma';

// GET /api/profile/[id]
export async function GET(
  request: NextRequest, 
  context: { params: { id: string } }
) {
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
    
    // Next.js 13+ için dinamik parametreleri güvenli bir şekilde kullanma
    const userId = context.params.id;
    console.log('Profil API isteği için userId:', userId);
    
    // Kullanıcı kendi profilini istiyor mu veya admin mi kontrol et
    if (decodedToken.userId !== userId && decodedToken.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz bulunmuyor' }, { status: 403 });
    }
    
    try {
      // Kullanıcı profilini getir
      const profile = await prisma.profile.findUnique({
        where: { userId },
        include: {
          notificationPrefs: true,
        },
      });
      
      // Profil yoksa, varsayılan bir profil oluştur
      if (!profile) {
        console.log('Profil bulunamadı, yeni profil oluşturuluyor');
        try {
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
        } catch (prismaError: any) {
          console.error('Profil oluşturma hatası:', prismaError);
          
          // Unique constraint hatası (profil zaten varsa)
          if (prismaError.code === 'P2002') {
            // Profili tekrar sorgula (race condition durumlarında yardımcı olur)
            const existingProfile = await prisma.profile.findUnique({
              where: { userId },
              include: {
                notificationPrefs: true,
              },
            });
            
            if (existingProfile) {
              console.log('Profil başka bir istekte oluşturulmuş, onu kullanıyoruz');
              return NextResponse.json(existingProfile);
            }
          }
          
          return NextResponse.json({ 
            error: 'Profil oluşturulurken bir hata oluştu',
            details: prismaError.message
          }, { status: 500 });
        }
      }
      
      return NextResponse.json(profile);
    } catch (dbError: any) {
      console.error('Veritabanı hatası:', dbError);
      return NextResponse.json({ 
        error: 'Veritabanı hatası',
        details: dbError.message
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Profil bilgileri alınırken hata:', error);
    return NextResponse.json({ 
      error: 'Profil bilgileri alınamadı',
      details: error.message || 'Bilinmeyen hata'
    }, { status: 500 });
  }
}