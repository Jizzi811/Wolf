import type { Metadata, Viewport } from 'next';
import { APP_CONFIG } from '@/app-config';
import { AmbientBackground } from '@/components/closer/ambient-background';
import { getSettings } from '@/lib/admin/settings';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://closer-henna.vercel.app');

/** Titel und Beschreibung kommen aus dem Admin (Texte & Design). */
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const title = s.texts.pageTitle || APP_CONFIG.pageTitle;
  const description = s.texts.pageDescription || APP_CONFIG.pageDescription;
  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    applicationName: s.persona.name,
    authors: [{ name: APP_CONFIG.companyName }],
    openGraph: {
      title,
      description,
      siteName: APP_CONFIG.companyName,
      locale: 'de_DE',
      type: 'website',
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: s.persona.name }],
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/og-image.png'] },
  };
}

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
