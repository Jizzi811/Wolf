# syntax=docker/dockerfile:1
#
# CLOSER Voice-Agent – Container zum Selbst-Hosten (Sektion 12 / SETUP-CLOSER.md).
#
# Der Agent ist ein langlebiger Worker: er verbindet sich mit deinem
# LiveKit-Projekt und wartet auf Jobs. Er wird NICHT bei LiveKit "deployed",
# sondern läuft hier auf deiner eigenen Infrastruktur (z. B. als Sevalla-Dienst)
# und umgeht so das "1 gehosteter Agent"-Limit des kostenlosen LiveKit-Tarifs.
#
# Nötige Environment-Variablen zur Laufzeit (im Hosting-Dienst setzen, NICHT
# ins Image bauen): siehe voice-agent/.env.example.

ARG NODE_VERSION=24
FROM node:${NODE_VERSION}-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV HOME="/app"

# ca-certificates: der native LiveKit-Core liest zur Laufzeit den System-Trust-Store.
RUN apt-get update -qq \
  && apt-get install --no-install-recommends -y ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# pnpm für reproduzierbare Builds pinnen.
RUN npm install -g pnpm@10

# --- Build-Stufe ---
FROM base AS build
WORKDIR /app

# Abhängigkeitsdatei zuerst kopieren (bessere Layer-Caches).
# Kein committeter Lockfile vorhanden -> ohne --frozen-lockfile installieren.
COPY package.json ./
RUN pnpm install

# ML-Modelle (VAD / Turn-Detector) vorab laden, damit der Start schnell ist.
RUN npx livekit-agents download-files

# Restlichen Code kopieren (siehe .dockerignore) und Dev-Deps entfernen.
COPY . .
RUN pnpm prune --prod

# --- Produktions-Stufe ---
FROM base
ARG UID=10001
RUN adduser --disabled-password --gecos "" --home "/app" --shell "/sbin/nologin" --uid "${UID}" appuser
WORKDIR /app
COPY --from=build --chown=appuser:appuser /app /app
USER appuser

ENV NODE_ENV=production

# "start" = Worker verbindet sich mit LiveKit und wartet auf Gespräche.
CMD ["pnpm", "start"]
