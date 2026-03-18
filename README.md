# Freello

> Application de gestion de projets et tâches inspirée de Trello — projet portfolio démontrant une architecture fullstack moderne avec event-driven architecture.

🌐 **Live** : [https://freello.site](https://freello.site)

---

## Stack technique

### Backend
- **NestJS** + TypeScript — framework Node.js modulaire
- **PostgreSQL** + TypeORM — base de données relationnelle avec migrations
- **Apache Kafka** (KRaft) — message broker event-driven
- **Schema Registry** + Avro — sérialisation des événements typés
- **Outbox Pattern** — garantie de livraison des événements Kafka
- **JWT** HttpOnly cookies — authentification sécurisée
- **Redis-less cache** in-memory — cache avec invalidation complète
- **Swagger** — documentation API auto-générée (`/api`)

### Frontend
- **React** + TypeScript + Vite
- **TailwindCSS** — styling utility-first
- **framer-motion** — animations fluides
- **@dnd-kit** — drag & drop Kanban
- **Axios** — client HTTP avec intercepteurs

### Infrastructure & DevOps
- **Nx monorepo** — gestion multi-apps et libs partagées
- **Docker** + Docker Compose — containerisation complète
- **GitHub Actions** — CI/CD (lint, test, build, push GHCR, deploy)
- **GHCR** — GitHub Container Registry pour les images Docker
- **VPS OVH** — hébergement production (Ubuntu 25.04)
- **nginx** — reverse proxy avec SSL
- **Let's Encrypt** — certificat SSL automatique

---

## Architecture

```
freello/                          # Nx monorepo
├── apps/
│   ├── backend/                  # NestJS API
│   │   ├── src/
│   │   │   ├── auth/             # JWT, Guards (JWT/Roles/SelfOrAdmin)
│   │   │   ├── user/             # CRUD utilisateurs
│   │   │   ├── project/          # CRUD projets + cache
│   │   │   ├── task/             # CRUD tâches + cache + Outbox
│   │   │   ├── assignment/       # Assignation tâches/utilisateurs
│   │   │   ├── kafka/            # Producer Avro + Schema Registry
│   │   │   ├── outbox/           # Outbox Pattern + Cron poller
│   │   │   └── migrations/       # TypeORM migrations
│   │   └── Dockerfile
│   ├── frontend/                 # React SPA
│   │   ├── src/
│   │   │   ├── pages/            # Login, Register, Dashboard, Project
│   │   │   ├── components/       # Layout, KanbanBoard, TaskRow, etc.
│   │   │   ├── hooks/            # useProjects, useTasks, useKanban
│   │   │   └── contexts/         # AuthContext, ThemeContext
│   │   └── Dockerfile
│   └── task-versioning/          # Consumer Kafka (CSV export)
├── libs/
│   └── api-types/                # DTOs partagés frontend/backend
├── nginx/
│   ├── nginx.conf                # Reverse proxy HTTPS
│   └── nginx-spa.conf            # SPA fallback
├── docker-compose.prod.yml       # Stack production complète
└── .github/workflows/ci.yml      # Pipeline CI/CD
```

---

## Fonctionnalités

- **Authentification** — inscription, connexion, déconnexion avec JWT HttpOnly cookies
- **Projets** — création, liste, suppression avec optimistic update et animations
- **Tâches** — CRUD complet, changement de statut inline, estimation en points
- **Vue Kanban** — drag & drop inter-colonnes avec @dnd-kit
- **Vue Liste** — filtres par statut, pagination, recherche
- **Event-driven** — chaque mutation tâche publie un événement Kafka via l'Outbox Pattern
- **Thème** — dark/light mode persisté
- **Responsive** — mobile, tablette, desktop

---

## Lancer en local

### Prérequis
- Node.js 20+
- Docker + Docker Compose

### Installation

```bash
git clone https://github.com/Matfen2/freello.git
cd freello
npm install
```

### Démarrage

```bash
# Lance l'infrastructure (PostgreSQL + Kafka + Schema Registry)
docker compose up -d postgres kafka schema-registry

# Backend (port 3333)
npx nx serve backend

# Frontend (port 4200)
npx nx serve frontend
```

### Variables d'environnement

Copie `.env.example` en `.env` et remplis les valeurs :

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=freello
DB_PASSWORD=freello
DB_DATABASE=freello
JWT_ACCESS_SECRET=your-secret-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
KAFKA_BROKERS=localhost:9092
SCHEMA_REGISTRY_URL=http://localhost:8081
```

---

## Tests

```bash
# Tests unitaires backend (53 tests)
npx nx test backend

# Lint
npx nx run-many -t lint
```

---

## CI/CD

Chaque push sur `main` déclenche automatiquement :

1. **Job `main`** — lint, tests, build, typecheck
2. **Job `docker`** (après `main`) — build images Docker, push sur GHCR, deploy SSH sur VPS OVH

```
push main → CI verte → Docker build → GHCR push → SSH deploy → freello.site mis à jour
```

---

## API

Documentation Swagger disponible sur [https://freello.site/api](https://freello.site/api)

Principales routes :
```
POST   /v1/auth/register
POST   /v1/auth/login
POST   /v1/auth/logout

GET    /v1/projects
POST   /v1/projects
DELETE /v1/projects/:id

GET    /v1/tasks?projectId=...&status=...&page=1&limit=20
POST   /v1/tasks
PATCH  /v1/tasks/:id
DELETE /v1/tasks/:id

GET    /v1/health
```

---

## Auteur

**Mathieu FENOUIL** — Développeur Full-Stack

- 🌐 [linkedin.com/in/mathieu-fenouil](https://linkedin.com/in/mathieu-fenouil)
- 💻 [github.com/Matfen2](https://github.com/Matfen2)

Projet réalisé dans le cadre d'un Bac+5 Ingénieur Logiciel (DevOps) chez Liora (ex-DataScientest).
