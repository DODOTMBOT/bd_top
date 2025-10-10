import "@/app/globals.css";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import AuthProvider from '@/components/auth/AuthProvider';
import AppNavbar from '@/components/shell/AppNavbar';

export const runtime = "nodejs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
          <HeroUIProvider>
            <AuthProvider>
              <AppNavbar />
              <main className="container py-6">{children}</main>
            </AuthProvider>
          </HeroUIProvider>
        </NextThemesProvider>
      </body>
    </html>
  );
}


