# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Multi-Stage-Build für die Next.js-App (CLOSER OS).
# Erzeugt ein schlankes Runtime-Image auf Basis des Next.js-Standalone-Outputs.
# Sevalla baut dieses Dockerfile und startet den Container; der Port wird über
# die PORT-Env gesetzt (Default hier 8080, passend zur Sevalla-Konfiguration).
# ---------------------------------------------------------------------------

FROM node:22-alpine AS base
# libc6-compat hilft bei manchen nativen Abhängigkeiten unter Alpine.
RUN apk add --no-cache libc6-compat
# Corepack aktivieren, damit die in package.json gepinnte pnpm-Version genutzt wird.
RUN corepack enable
WORKDIR /app

# --- Dependencies (nur Manifeste kopieren -> besseres Layer-Caching) ---------
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# --- Build -------------------------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Telemetrie im Build deaktivieren.
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# --- Runtime -----------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# In Containern auf allen Interfaces lauschen; Port über Sevalla/PORT steuerbar.
ENV HOSTNAME=0.0.0.0
ENV PORT=8080

# Non-root-User für die Laufzeit.
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Öffentliche Assets und der Standalone-Server.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 8080

# Der Standalone-Output enthält einen eigenständigen Server (server.js),
# der PORT und HOSTNAME aus den Env-Variablen liest.
CMD ["node", "server.js"]
