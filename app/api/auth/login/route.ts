import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import * as bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// Giriş şeması doğrulama
const loginSchema = z.object({
  email: z.string().email({ message: 'Geçerli bir e-posta adresi giriniz' }),
  password: z.string().min(6, { message: 'Şifre en az 6 karakter olmalıdır' }),
  twoFactorCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Gelen verileri doğrula
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Doğrulama hatası', issues: result.error.issues },
        { status: 400 }
      );
    }
    
    const { email, password, twoFactorCode } = result.data;
    
    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        twoFactorEnabled: true,
        twoFactorSecret: true
      }
    });
    
    // Kullanıcı bulunamadı veya şifre eşleşmiyor
    if (!user) {
      return NextResponse.json(
        { error: 'Geçersiz e-posta veya şifre' },
        { status: 401 }
      );
    }
    
    // Şifre doğrulama
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Geçersiz e-posta veya şifre' },
        { status: 401 }
      );
    }
    
    // 2FA kontrolü
    if (user.twoFactorEnabled) {
      // 2FA kodu gönderilmediyse
      if (!twoFactorCode) {
        return NextResponse.json(
          { 
            requiresTwoFactor: true,
            message: 'İki faktörlü kimlik doğrulama kodu gerekli'
          },
          { status: 200 }  // 200 dönüyoruz çünkü başarıyla kimlik doğrulandı, sadece 2FA kodu gerekli
        );
      }
      
      // 2FA doğrulama
      if (!user.twoFactorSecret) {
        return NextResponse.json(
          { error: '2FA etkin ancak yapılandırılmamış' },
          { status: 500 }
        );
      }
      
      // 2FA doğrulama kodunu kontrol et - bu kısmı ayrı bir endpoint ile de yapabiliriz
      // Basit tutmak için burada bırakıyoruz
      const { verifyTwoFactorCode } = await import('@/app/lib/twoFactorAuth');
      const isValid = verifyTwoFactorCode(twoFactorCode, user.twoFactorSecret);
      
      if (!isValid) {
        return NextResponse.json(
          { error: 'Geçersiz iki faktörlü kimlik doğrulama kodu' },
          { status: 401 }
        );
      }
    }
    
    // JWT token oluştur
    const token = sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );
    
    // Hassas bilgileri çıkar
    const { password: _, twoFactorSecret: __, ...userWithoutSensitiveInfo } = user;
    
    // Cookie'ye token'ı kaydet
    const response = NextResponse.json(
      { message: 'Giriş başarılı', user: userWithoutSensitiveInfo },
      { status: 200 }
    );
    
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 gün
      path: '/',
      sameSite: 'strict',
    });
    
    return response;
  } catch (error) {
    console.error('Giriş hatası:', error);
    return NextResponse.json(
      { error: 'Giriş yapılırken bir hata oluştu' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}