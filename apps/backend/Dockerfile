# ── Stage 1 : Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY .npmrc* ./
RUN npm ci --legacy-peer-deps

COPY . .

RUN npx nx build backend --prod

# ── Stage 2 : Production ──────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copie uniquement les dépendances de production
COPY package*.json ./
COPY .npmrc* ./
RUN npm ci --omit=dev --legacy-peer-deps && npm cache clean --force

# Copie le build
COPY --from=builder /app/dist/apps/backend ./dist
COPY --from=builder /app/apps/backend/avro ./avro
COPY --from=builder /app/libs ./libs

EXPOSE 3333

CMD ["node", "dist/main.js"]