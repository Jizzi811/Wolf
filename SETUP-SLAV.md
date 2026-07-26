# SLAV – Reporter aus Rheinland-Pflanz 🍞📻

Ein **Klon** der Voice-Agent-App mit einer neuen Persona: **Reporter Slav** (ohne Dach),
ein alberner, total verklatschter Sprachassistent aus Rheinland-Pfalz, der morgens sein
Brot immer in einer riesengroßen Toastmaschine zubereitet und ab und zu charmante
Wortfindungsschwierigkeiten hat.

## Wie das Klonen aufgebaut ist

Jede Persona lebt in einem eigenen Ordner unter `lib/<persona>/` und ist unabhängig:

| Datei | Zweck |
| --- | --- |
| `lib/slav/system-prompt.ts` | Persönlichkeit & Regeln von Slav |
| `lib/slav/knowledge.ts` | Fiktive Comedy-Welt (Toastmaschine, Dorffiguren, Running Gags) |
| `lib/slav/assistant.ts` | Vapi-Assistent (Modell, Stimme, Begrüßung) |
| `lib/closer/*` | Die alte CLOSER-Persona bleibt erhalten und einsatzbereit |

Der **Persona-Schalter** liegt zentral in `lib/active-persona.ts`. Der Hook
`hooks/use-vapi.ts` nutzt ausschließlich `buildActiveAssistant` – so lässt sich die
App mit **einer Zeile** auf eine andere Persona (oder Oberfläche) umstellen.

## Persona wechseln

In `lib/active-persona.ts` den Import tauschen:

```ts
// Slav aktiv (Standard):
import { buildSlavAssistant, SLAV_GREETING, SLAV_LANGUAGE } from './slav/assistant';
export const buildActiveAssistant = buildSlavAssistant;

// … oder wieder CLOSER:
// import { buildCloserAssistant, CLOSER_GREETING, CLOSER_LANGUAGE } from './closer/assistant';
// export const buildActiveAssistant = buildCloserAssistant;
```

Zusätzlich das Branding anpassen:

- `app-config.ts` – Titel, Firmenname, Akzentfarbe, Orb-Bild
- `lib/ui-text.ts` – alle sichtbaren Oberflächen-Texte

## Noch zu erledigen (optional)

1. **Porträt einsetzen:** Das Bild aus dem Upload als `public/…png` ablegen und
   `orbImageSrc` in `app-config.ts` darauf zeigen lassen (aktuell noch der
   Platzhalter `johann-orb.png`).
2. **Stimme wählen:** In `lib/slav/assistant.ts` ist `voiceId` ein funktionierender
   Platzhalter. Für Slav am besten eine verspielte, warme deutsche Männerstimme im
   Vapi-Dashboard / ElevenLabs auswählen und die `voiceId` ersetzen.
3. **Vapi-Keys:** Wie gehabt über `.env` (`NEXT_PUBLIC_VAPI_PUBLIC_KEY`), siehe
   `.env.example` und `SETUP-CLOSER.md`.

## Charakter-Kurzprofil

- **Name:** Slav (sprich „Slaw", ohne Akzent auf dem A)
- **Herkunft:** Rheinland-Pfalz, liebevoll „Rheinland-Pflanz"
- **Beruf:** Dorf-Reporter, präsentiert alles als Eilmeldung
- **Markenzeichen:** riesengroße Toastmaschine, morgendliches Brot-Ritual
- **Ton:** albern, total verklatscht (harmlos, erfunden), warmherzig
- **Quirk:** gelegentliche, charmante Wortfindungsschwierigkeiten
- **Wichtig:** fiktive Figur, tratscht nie über echte Personen, erfindet keine echten Fakten
