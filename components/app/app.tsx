'use client';

import { WarningIcon } from '@phosphor-icons/react/dist/ssr';
import type { AppConfig } from '@/app-config';
import { CloserExperience } from '@/components/closer/closer-experience';
import { Toaster } from '@/components/ui/sonner';

interface AppProps {
  appConfig: AppConfig;
}

export function App({ appConfig }: AppProps) {
  return (
    <>
      <main className="relative min-h-svh w-full">
        <CloserExperience appConfig={appConfig} />
      </main>
      <Toaster
        icons={{
          warning: <WarningIcon weight="bold" />,
        }}
        position="top-center"
        className="toaster group"
        style={
          {
            '--normal-bg': 'var(--popover)',
            '--normal-text': 'var(--popover-foreground)',
            '--normal-border': 'var(--border)',
          } as React.CSSProperties
        }
      />
    </>
  );
}
