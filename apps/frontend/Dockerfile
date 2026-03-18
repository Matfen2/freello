# ── Stage 1 : Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY .npmrc* ./
RUN npm ci --legacy-peer-deps

COPY . .

ARG VITE_API_URL=https://freello.site/api
ENV VITE_API_URL=$VITE_API_URL

RUN npx nx build frontend --prod

# ── Stage 2 : Serve avec nginx ────────────────────────────────────────────────
FROM nginx:alpine AS runner

COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY nginx/nginx-spa.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]