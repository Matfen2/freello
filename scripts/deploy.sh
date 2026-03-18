#!/bin/bash
set -e

echo "🚀 Deploying Freello to production..."

# Pull latest images
docker compose -f docker-compose.prod.yml pull backend frontend

# Restart services with zero-downtime
docker compose -f docker-compose.prod.yml up -d --no-deps --build backend frontend

# Clean up old images
docker image prune -f

echo "✅ Deployment complete!"
docker compose -f docker-compose.prod.yml ps