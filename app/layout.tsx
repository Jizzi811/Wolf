import type { Metadata, Viewport } from 'next';
import { APP_CONFIG } from '@/app-config';
import { AmbientBackground } from '@/components/closer/ambient-background';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://closer.kickstartercash.club';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: APP_CONFIG.pageTitle,
  description: APP_CONFIG.pageDescription,
  applicationName: APP_CONFIG.productName,
  authors: [{ name: APP_CONFIG.companyName }],
  openGraph: {
    title: APP_CONFIG.pageTitle,
    description: APP_CONFIG.pageDescription,
    siteName: APP_CONFIG.companyName,
    locale: 'de_DE',
    type: 'website',
    // Platzhalter-Grafik – bei Bedarf durch finales Marken-OG-Bild ersetzen.
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'CLOSER' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_CONFIG.pageTitle,
    description: APP_CONFIG.pageDescription,
    images: ['/og-image.png'],
  },
};

export const viewport: Viewport = {
  themeColor: APP_CONFIG.themeColor,
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        {/* Schriften über <link> (Browser-Laufzeit) – vermeidet Build-Zeit-Abhängigkeit. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Schriften via <link> statt next/font, um einen Build-Zeit-Download von
            Google Fonts zu vermeiden (in abgeschotteten Build-Umgebungen sonst
            fehleranfällig). Der Browser lädt sie zur Laufzeit mit Fallbacks. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-svh antialiased">
        <AmbientBackground />
        {children}
      </body>
    </html>
  );
}
