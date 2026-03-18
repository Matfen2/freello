#!/bin/bash
# Obtenir le certificat SSL Let's Encrypt
set -e

echo "🔒 Initializing SSL certificate for freello.site..."

cd /home/ubuntu/freello

# Lance nginx en HTTP seulement pour la validation ACME
docker compose -f docker-compose.prod.yml up -d nginx

# Attend que nginx soit prêt
sleep 5

# Lance certbot
docker compose -f docker-compose.prod.yml run --rm certbot

echo "✅ SSL certificate obtained!"
echo "Restart nginx to apply:"
echo "  docker compose -f docker-compose.prod.yml restart nginx"