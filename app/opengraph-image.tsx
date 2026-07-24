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
          backgroundColor: '#0a0a0c',
          backgroundImage:
            'radial-gradient(circle at 78% 30%, rgba(212,166,58,0.35) 0%, rgba(10,10,12,0) 45%)',
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 6,
            color: '#d4a63a',
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
            color: '#f2ead6',
            fontWeight: 700,
            maxWidth: 900,
          }}
        >
          Triff CLOSER.
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 34,
            color: '#a89f8b',
            maxWidth: 820,
          }}
        >
          Charme im Anzug. Klartext im Kopf.
        </div>
      </div>
    ),
    { ...size }
  );
}
