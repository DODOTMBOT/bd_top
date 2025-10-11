import "@/app/globals.css";
import { Providers } from "./providers";

export const revalidate = 0;
export const runtime = "nodejs";

export const metadata = {
  title: "HoReCa SaaS",
  description: "Система управления ресторанным бизнесом",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}


