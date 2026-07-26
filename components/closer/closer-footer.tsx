import { uiText } from '@/lib/ui-text';

/** Footer mit Disclaimer – CLOSER ist ein KI-Gesprächspartner, keine reale Person. */
export function CloserFooter() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-6 pb-6 pt-10">
      <p className="mx-auto max-w-3xl text-center text-[0.72rem] leading-relaxed text-muted/70">
        {uiText.footer}
      </p>
    </footer>
  );
}
