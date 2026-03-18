#!/bin/bash
# Script à exécuter UNE SEULE FOIS sur l'EC2 après sa création
set -e

echo "📦 Installing Docker..."
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker ubuntu

echo "📁 Cloning repository..."
git clone https://github.com/Matfen2/freello.git /home/ubuntu/freello
cd /home/ubuntu/freello

echo "🔐 Creating .env file..."
cp .env.prod.example .env
echo ""
echo "⚠️  IMPORTANT: Edit /home/ubuntu/freello/.env with your real values!"
echo "   nano /home/ubuntu/freello/.env"
echo ""

echo "📂 Creating nginx directory..."
mkdir -p nginx certbot/conf certbot/www

echo "✅ EC2 setup complete! Next steps:"
echo "1. Edit .env with real passwords and secrets"
echo "2. Point freello.site DNS A record to this EC2 IP"
echo "3. Run: bash scripts/init-ssl.sh"
echo "4. Run: bash scripts/deploy.sh"