import { ImageResponse } from 'next/og';
import { APP_CONFIG_DEFAULTS } from '@/app-config';
import { CLOSER_CONTENT } from '@/lib/closer-content';

/*
 * Platzhalter-Open-Graph-Bild (Sektion 18).
 *
 * Es wird bewusst kein erfundenes Marketing-Bild verwendet. Diese Grafik ist
 * vollständig selbsttragend (nur Text + Verläufe, keine externen Dateien) und
 * dient als klar gekennzeichneter Platzhalter. Zum Ersetzen kann hier ein
 * echtes OG-Bild (z. B. mit dem Orb) hinterlegt werden.
 */

export const alt = APP_CONFIG_DEFAULTS.pageTitle;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: size.width,
          height: size.height,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          backgroundColor: '#08070d',
          backgroundImage:
            'radial-gradient(circle at 78% 30%, rgba(139,108,255,0.35) 0%, rgba(8,7,13,0) 45%)',
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 6,
            color: '#8b6cff',
            fontWeight: 700,
          }}
        >
          {CLOSER_CONTENT.eyebrow}
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 92,
            lineHeight: 1.02,
            color: '#ece9fb',
            fontWeight: 700,
            maxWidth: 900,
          }}
        >
          {CLOSER_CONTENT.heading.line1}
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 34,
            color: '#9c96c4',
            maxWidth: 820,
          }}
        >
          {CLOSER_CONTENT.heading.line2}
        </div>
      </div>
    ),
    { ...size }
  );
}
