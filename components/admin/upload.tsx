'use client';

import * as React from 'react';
import { upload } from '@vercel/blob/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { registerDocumentAction } from '@/lib/admin/actions';

/** Datei-Upload (alle Formate) direkt in den Blob-Speicher, danach Registrierung + Auslesen. */
export function DocumentUpload({ blobReady }: { blobReady: boolean }) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [msg, setMsg] = React.useState<string | null>(null);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setMsg(null);
    try {
      for (const file of Array.from(files)) {
        setProgress(0);
        const blob = await upload(`dokumente/${file.name}`, file, {
          access: 'public',
          handleUploadUrl: '/api/upload',
          clientPayload: 'document',
          onUploadProgress: (p) => setProgress(Math.round(p.percentage)),
        });
        const r = await registerDocumentAction({ url: blob.url, pathname: blob.pathname, filename: file.name, mime: file.type || 'application/octet-stream', size: file.size });
        if (!r.ok) throw new Error(r.message);
        setMsg(`${file.name}: hochgeladen und ausgelesen.`);
      }
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Upload fehlgeschlagen.');
    } finally {
      setBusy(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div
      className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gold/30 bg-ink/40 p-6 text-center"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        if (blobReady) void onFiles(e.dataTransfer.files);
      }}
    >
      <p className="text-sm text-cream">Dateien hierher ziehen oder auswählen</p>
      <p className="text-xs text-muted">PDF, Word, Text, Markdown, CSV, Bilder, Audio (MP3, M4A, WAV) und Video (MP4, MOV) bis 500 MB. Audio und Video werden transkribiert, nur der Text wird gespeichert.</p>
      <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => void onFiles(e.target.files)} disabled={!blobReady || busy} />
      <Button variant="primary" onClick={() => inputRef.current?.click()} disabled={!blobReady || busy}>
        {busy ? (progress > 0 && progress < 100 ? `Hochladen … ${progress} %` : 'Wird verarbeitet …') : 'Dateien auswählen'}
      </Button>
      {!blobReady ? <p className="text-xs text-danger">Blob-Speicher nicht verbunden (BLOB_READ_WRITE_TOKEN fehlt). Text kann trotzdem unten eingefügt werden.</p> : null}
      {msg ? <p className="text-xs text-muted">{msg}</p> : null}
    </div>
  );
}

/** Bild-Upload für das Persona-Bild; schreibt die URL in ein verstecktes Feld. */
export function ImageUpload({ name, defaultValue, blobReady }: { name: string; defaultValue: string; blobReady: boolean }) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [url, setUrl] = React.useState(defaultValue);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setErr(null);
    try {
      const blob = await upload(`persona/${file.name}`, file, { access: 'public', handleUploadUrl: '/api/upload', clientPayload: 'image' });
      setUrl(blob.url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Upload fehlgeschlagen.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative h-32 w-32 flex-none overflow-hidden rounded-full border border-gold/30 bg-ink">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url || '/johann-orb.png'} alt="" className="h-full w-full object-contain" />
      </div>
      <div className="flex flex-col gap-2">
        <input type="hidden" name={name} value={url} />
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" className="hidden" onChange={(e) => void onFile(e.target.files?.[0])} />
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => inputRef.current?.click()} disabled={!blobReady || busy}>{busy ? 'Lädt …' : 'Bild hochladen'}</Button>
          <Button variant="ghost" onClick={() => setUrl('/johann-orb.png')}>Standardbild</Button>
        </div>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="oder Bild-URL einfügen"
          className="w-full rounded-xl border border-gold/20 bg-ink/70 px-3 py-2 text-xs text-cream"
        />
        <p className="text-xs text-muted">Am besten PNG mit transparentem Hintergrund, quadratisch, mindestens 800 × 800 Pixel.</p>
        {!blobReady ? <p className="text-xs text-danger">Blob-Speicher nicht verbunden; nur URL-Eingabe möglich.</p> : null}
        {err ? <p className="text-xs text-danger">{err}</p> : null}
      </div>
    </div>
  );
}
