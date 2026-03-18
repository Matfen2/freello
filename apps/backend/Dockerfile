# ── Stage 1 : Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY .npmrc* ./
RUN npm ci --legacy-peer-deps

COPY . .

RUN npx nx build backend --prod

# Debug — voir ce qui a été généré
RUN find /app/dist -name "main.js" 2>/dev/null || echo "main.js not found" && ls /app/dist/ 2>/dev/null || echo "no dist"

# ── Stage 2 : Production ──────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY .npmrc* ./
RUN npm ci --legacy-peer-deps && npm cache clean --force

# Le build Nx backend sort dans dist/apps/backend
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/avro ./avro

EXPOSE 3333

CMD ["node", "dist/main.js"]