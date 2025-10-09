export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ThemeProvider from '@/components/theme/ThemeProvider';
import AuthProvider from '@/components/auth/AuthProvider';
import './globals.css';
import AppNavbar from '@/components/shell/AppNavbar';

const inter = Inter({ subsets: ['latin', 'cyrillic'], display: 'swap' });

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || 'HoReCa SaaS',
  description: 'Starter for HoReCa SaaS',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className + ' min-h-screen bg-background text-foreground'}>
        <AuthProvider>
          <ThemeProvider>
            <AppNavbar />
            <main className="container py-6">{children}</main>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}


