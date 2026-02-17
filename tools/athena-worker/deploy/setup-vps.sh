#!/bin/bash
# =============================================
# SETUP VPS - Doctor Auto IA Mae (Athena)
# Hostinger KVM 8 - Ubuntu 22.04+
# 8vCPU, 32GB RAM, 400GB SSD
# AGORA COM DOCKER
# =============================================

set -e

DOMAIN="${1:-ia.doctorauto.com.br}"
INSTALL_DIR="/opt/doctor-auto-ia"
EMAIL="${2:-admin@doctorauto.com.br}"

echo "=========================================="
echo "  Doctor Auto IA - Setup VPS (Docker)"
echo "  Dominio: $DOMAIN"
echo "=========================================="

# 1. System update
echo "[1/6] Atualizando sistema..."
sudo apt update && sudo apt upgrade -y

# 2. Install Docker
echo "[2/6] Instalando Docker..."
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker $(whoami)
  echo "Docker instalado. AVISO: Faca logout/login pra grupo docker ativar."
fi

# Install Docker Compose plugin
if ! docker compose version &> /dev/null; then
  sudo apt install -y docker-compose-plugin
fi

echo "Docker: $(docker --version)"
echo "Compose: $(docker compose version)"

# 3. Install Git
echo "[3/6] Instalando Git..."
sudo apt install -y git

# 4. Create project directory
echo "[4/6] Criando estrutura do projeto..."
sudo mkdir -p $INSTALL_DIR
sudo chown $(whoami):$(whoami) $INSTALL_DIR

# 5. Clone or copy project
echo "[5/6] Configurando projeto..."
cd $INSTALL_DIR

if [ ! -f "docker-compose.yml" ]; then
  echo ""
  echo "COPIE OS ARQUIVOS DO PROJETO PARA $INSTALL_DIR:"
  echo "  Opcao 1 (git): git clone -b claude-athena https://github.com/toliveira1802-sketch/git-push-fix.git temp && cp -r temp/tools/athena-worker/* . && rm -rf temp"
  echo "  Opcao 2 (scp): scp -r tools/athena-worker/* user@vps:$INSTALL_DIR/"
  echo ""
fi

# 6. Create .env if not exists
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "AVISO: Configure o arquivo .env"
  fi
fi

# 7. SSL Certificate (primeira vez, antes de subir nginx com SSL)
echo "[6/6] Preparando SSL..."
mkdir -p docker/nginx/certbot-webroot

echo ""
echo "=========================================="
echo "  SETUP CONCLUIDO!"
echo "=========================================="
echo ""
echo "  PROXIMOS PASSOS:"
echo ""
echo "  1. Copie os arquivos do projeto pra $INSTALL_DIR"
echo ""
echo "  2. Configure o .env:"
echo "     nano $INSTALL_DIR/.env"
echo ""
echo "  3. Primeiro boot (sem SSL):"
echo "     cd $INSTALL_DIR"
echo "     docker compose up -d ollama chromadb redis"
echo ""
echo "  4. Baixe os modelos Ollama:"
echo "     docker exec athena-ollama ollama pull llama3.1:8b"
echo "     docker exec athena-ollama ollama pull mistral:7b"
echo ""
echo "  5. Gere o certificado SSL:"
echo "     docker compose run --rm certbot certonly --webroot -w /var/www/certbot -d $DOMAIN --email $EMAIL --agree-tos --no-eff-email"
echo ""
echo "  6. Suba tudo:"
echo "     docker compose up -d"
echo ""
echo "  7. Verifique:"
echo "     docker compose ps"
echo "     docker compose logs -f ia-mae"
echo ""
echo "  8. Ingeste conhecimento:"
echo "     docker exec athena-worker npm run ingest"
echo ""
echo "=========================================="
