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
    
    const { email, password } = result.data;
    
    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email },
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
    
    // Cookie'ye token'ı kaydet
    const cookieStore = cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 gün
      path: '/',
      sameSite: 'strict',
    });
    
    // Hassas bilgileri çıkar
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json(
      { message: 'Giriş başarılı', user: userWithoutPassword },
      { status: 200 }
    );
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