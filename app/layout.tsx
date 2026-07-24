import type { Metadata, Viewport } from 'next';
import { Public_Sans } from 'next/font/google';
import localFont from 'next/font/local';
import { headers } from 'next/headers';
import { ThemeProvider } from '@/components/app/theme-provider';
import { cn } from '@/lib/shadcn/utils';
import { getAppConfig, getStyles } from '@/lib/utils';
import '@/styles/globals.css';

const publicSans = Public_Sans({
  variable: '--font-public-sans',
  subsets: ['latin'],
});

const commitMono = localFont({
  display: 'swap',
  variable: '--font-commit-mono',
  src: [
    {
      path: '../fonts/CommitMono-400-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/CommitMono-700-Regular.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../fonts/CommitMono-400-Italic.otf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../fonts/CommitMono-700-Italic.otf',
      weight: '700',
      style: 'italic',
    },
  ],
});

export async function generateMetadata(): Promise<Metadata> {
  const hdrs = await headers();
  const appConfig = await getAppConfig(hdrs);

  return {
    title: appConfig.pageTitle,
    description: appConfig.pageDescription,
    applicationName: appConfig.companyName,
    openGraph: {
      title: appConfig.pageTitle,
      description: appConfig.pageDescription,
      siteName: appConfig.companyName,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: appConfig.pageTitle,
      description: appConfig.pageDescription,
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#0a0a0c',
  colorScheme: 'dark',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const hdrs = await headers();
  const appConfig = await getAppConfig(hdrs);
  const styles = getStyles(appConfig);
  const { companyName } = appConfig;

  return (
    <html
      lang="de"
      suppressHydrationWarning
      className={cn(
        publicSans.variable,
        commitMono.variable,
        'scroll-smooth font-sans antialiased'
      )}
    >
      <head>{styles && <style>{styles}</style>}</head>
      <body className="overflow-x-hidden">
        {/* CLOSER ist bewusst dunkel gehalten – Theme fest auf "dark". */}
        <ThemeProvider
          attribute="class"
          forcedTheme="dark"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <header className="fixed top-0 left-0 z-40 hidden w-full flex-row justify-between p-6 md:flex">
            <span className="text-gold font-mono text-xs font-bold tracking-[0.2em] uppercase">
              {companyName}
            </span>
          </header>

          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
