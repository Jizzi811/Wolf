import { NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { getCurrentUser } from '@/lib/auth/session';
import { hasModule } from '@/lib/auth/guards';

export const dynamic = 'force-dynamic';

const ALLOWED = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain', 'text/markdown', 'text/csv', 'text/html', 'application/json',
  'image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml',
  'audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/webm',
  'video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska',
];

/**
 * Erzeugt Upload-Tokens für Vercel Blob (Client-Upload, damit auch große
 * Audio-/Video-Dateien ohne Server-Limit hochgeladen werden können).
 */
export async function POST(req: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'BLOB_READ_WRITE_TOKEN fehlt. Bitte in Vercel einen Blob-Speicher mit dem Projekt verbinden.' }, { status: 503 });
  }
  const user = await getCurrentUser().catch(() => null);
  if (!user || !(hasModule(user, 'dateien') || hasModule(user, 'persona'))) {
    return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });
  }
  const body = (await req.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const purpose = clientPayload === 'image' ? 'image' : 'document';
        return {
          allowedContentTypes: purpose === 'image' ? ALLOWED.filter((t) => t.startsWith('image/')) : ALLOWED,
          maximumSizeInBytes: purpose === 'image' ? 8 * 1024 * 1024 : 500 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId: user.id, purpose, pathname }),
        };
      },
      onUploadCompleted: async () => {
        /* Registrierung erfolgt vom Browser aus über eine Server-Aktion (funktioniert auch lokal). */
      },
    });
    return NextResponse.json(json);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Upload fehlgeschlagen' }, { status: 400 });
  }
}
