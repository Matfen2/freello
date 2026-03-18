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

# Copie node_modules complets depuis le builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/avro ./avro

EXPOSE 3333

CMD ["node", "dist/main.js"]