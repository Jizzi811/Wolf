import { CloserApp } from '@/components/closer/closer-app';
import { CloserFooter } from '@/components/closer/closer-footer';
import { LivePanel } from '@/components/closer/live-panel';

export default function Page() {
  return (
    <>
      <CloserApp />
      <LivePanel />
      <CloserFooter />
    </>
  );
}
