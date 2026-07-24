# Orb-Bild ablegen

Die zentrale Figur der Anwendung ist der goldene Orb. Lege die Bilddatei hier ab:

```
public/johann-orb.png
```

Erwartet wird ein **quadratisches PNG** (empfohlen 1024×1024 px, transparenter
Hintergrund) mit dem goldenen Orb – Sonnenbrille, Hut, Anzug, selbstbewusstes
Grinsen, Gold-Schwarz-Ästhetik.

**Solange die Datei fehlt**, zeigt die Oberfläche automatisch einen
optisch passenden CSS-Fallback-Orb an (siehe `components/closer/closer-orb.tsx`).
Der Pfad `/johann-orb.png` bleibt in jedem Fall gültig – sobald die Datei
vorhanden ist, wird sie ohne weitere Änderungen verwendet.

> Diese Hinweisdatei kann gelöscht werden, sobald `johann-orb.png` vorhanden ist.
