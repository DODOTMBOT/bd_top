import './globals.css'
import ClientProviders from '@/components/ClientProviders'

export const runtime = 'nodejs'

export const metadata = {
  title: "HoReCa SaaS",
  description: "Система управления ресторанным бизнесом",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}


