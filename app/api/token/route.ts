import { NextResponse } from 'next/server';
import { AccessToken, type AccessTokenOptions, type VideoGrant } from 'livekit-server-sdk';
import { RoomConfiguration } from '@livekit/protocol';

type ConnectionDetails = {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantToken: string;
};

// Erwartete Environment-Variablen (serverseitig, in `.env.local`):
const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;

// Ergebnisse nicht cachen.
export const revalidate = 0;

/**
 * ⚠️ SICHERHEITSHINWEIS
 * Diese Route gibt LiveKit-Tokens ohne eigene Authentifizierung aus. Für einen
 * öffentlichen Produktivbetrieb sollte davor eine Auth-Schicht ergänzt werden
 * (Login/Rate-Limit), damit nicht beliebige Dritte Tokens anfordern können.
 * Über `LIVEKIT_TOKEN_ROUTE_DISABLED=true` lässt sich die Route hart sperren.
 */
const ROUTE_DISABLED =
  (process.env.LIVEKIT_TOKEN_ROUTE_DISABLED ?? 'false').toLowerCase() === 'true';

function missingEnv(): string[] {
  const missing: string[] = [];
  if (!LIVEKIT_URL) missing.push('LIVEKIT_URL');
  if (!API_KEY) missing.push('LIVEKIT_API_KEY');
  if (!API_SECRET) missing.push('LIVEKIT_API_SECRET');
  return missing;
}

/**
 * Health-/Konfigurationsprüfung ohne Geheimnisse: meldet nur, ob die
 * LiveKit-Zugangsdaten gesetzt sind. Das Frontend nutzt dies, um bei einem
 * fehlgeschlagenen Verbindungsaufbau eine präzise Fehlermeldung zu zeigen.
 */
export async function GET() {
  return NextResponse.json(
    { configured: missingEnv().length === 0, disabled: ROUTE_DISABLED },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function POST(req: Request) {
  if (ROUTE_DISABLED) {
    return NextResponse.json(
      { error: 'disabled', message: 'Token route is disabled.' },
      { status: 403 }
    );
  }

  const missing = missingEnv();
  if (missing.length > 0) {
    // Klar als Konfigurationsproblem kennzeichnen (kein Stacktrace nach außen).
    console.error(`Token route misconfigured. Missing env: ${missing.join(', ')}`);
    return NextResponse.json(
      { error: 'config', message: `Missing environment variables: ${missing.join(', ')}` },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  try {
    // Room-Konfiguration aus dem Request-Body übernehmen.
    const body = await req.json().catch(() => ({}));
    const roomConfig = body?.room_config
      ? RoomConfiguration.fromJson(body.room_config, { ignoreUnknownFields: true })
      : new RoomConfiguration();

    const participantName = 'user';
    const participantIdentity = `voice_assistant_user_${Math.floor(Math.random() * 10_000)}`;
    const roomName = `voice_assistant_room_${Math.floor(Math.random() * 10_000)}`;

    const participantToken = await createParticipantToken(
      { identity: participantIdentity, name: participantName },
      roomName,
      roomConfig
    );

    const data: ConnectionDetails = {
      serverUrl: LIVEKIT_URL!,
      roomName,
      participantName,
      participantToken,
    };
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    // Serverseitig loggen, nach außen nur eine neutrale Meldung.
    console.error('Token route error:', error);
    return NextResponse.json(
      { error: 'connection', message: 'Failed to create token.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

function createParticipantToken(
  userInfo: AccessTokenOptions,
  roomName: string,
  roomConfig: RoomConfiguration | undefined
): Promise<string> {
  const at = new AccessToken(API_KEY, API_SECRET, {
    ...userInfo,
    ttl: '15m',
  });
  const grant: VideoGrant = {
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  };
  at.addGrant(grant);

  if (roomConfig) {
    at.roomConfig = roomConfig;
  }

  return at.toJwt();
}
