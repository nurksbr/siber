import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientWrapper from "./components/ClientWrapper";
import { AuthProvider } from "./context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CYBERLY - Siber Güvenlik Farkındalık Platformu",
  description: "Kişiler ve kurumlar için siber güvenlik farkındalığı, eğitimler ve güncel tehdit istihbaratı",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 text-white`}
      >
        {/* Kod akışı animasyonu istemci tarafında render edilecek */}
        <ClientWrapper />
        
        <AuthProvider>
          <div className="relative z-20">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
