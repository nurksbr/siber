import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/app/lib/prisma';

// GET /api/profile/[id]
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get the current session to verify the user
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }
    
    // Check if the user is requesting their own profile or has admin rights
    const userId = params.id;
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });
    
    if (!currentUser || (currentUser.id !== userId && currentUser.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz bulunmuyor' }, { status: 403 });
    }
    
    // Get the user profile
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        notificationPrefs: true,
      },
    });
    
    // If profile doesn't exist, create a default one
    if (!profile) {
      const newProfile = await prisma.profile.create({
        data: {
          userId,
          theme: 'LIGHT',
          securityLevel: 'BEGINNER',
          preferredLanguage: 'tr',
          contentPreferences: [],
          interests: [],
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