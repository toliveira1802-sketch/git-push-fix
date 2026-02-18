#!/bin/bash
# =============================================
# SETUP VPS - Doctor Auto IA (Sophia)
# Hostinger KVM 8 - Ubuntu 22.04+
# 8vCPU, 32GB RAM, 400GB SSD
# =============================================

set -e

DOMAIN="${1:-ia.doctorauto.com.br}"
INSTALL_DIR="/opt/doctor-auto-ia"
EMAIL="${2:-admin@doctorauto.com.br}"

echo "=========================================="
echo "  Doctor Auto IA - Setup VPS (Docker)"
echo "  Sophia (IA Rainha) + Princesas"
echo "  Dominio: $DOMAIN"
echo "=========================================="

# 1. System update
echo "[1/7] Atualizando sistema..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git htop ufw

# 2. Firewall
echo "[2/7] Configurando firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
echo "Firewall: apenas SSH, HTTP e HTTPS abertos"

# 3. Install Docker
echo "[3/7] Instalando Docker..."
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

# 4. Create project directory
echo "[4/7] Criando estrutura do projeto..."
sudo mkdir -p $INSTALL_DIR
sudo chown $(whoami):$(whoami) $INSTALL_DIR

# 5. Create swap (ajuda com Ollama)
echo "[5/7] Configurando swap..."
if [ ! -f /swapfile ]; then
  sudo fallocate -l 8G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  echo "Swap de 8GB criado"
fi

# 6. Clone or copy project
echo "[6/7] Configurando projeto..."
cd $INSTALL_DIR

if [ ! -f "docker-compose.yml" ]; then
  echo ""
  echo "COPIE OS ARQUIVOS DO PROJETO PARA $INSTALL_DIR:"
  echo "  Opcao 1 (git):"
  echo "    git clone -b claude-athena https://github.com/toliveira1802-sketch/git-push-fix.git temp"
  echo "    cp -r temp/tools/athena-worker/* ."
  echo "    rm -rf temp"
  echo ""
  echo "  Opcao 2 (scp do seu PC):"
  echo "    scp -r tools/athena-worker/* user@vps:$INSTALL_DIR/"
  echo ""
fi

# 7. Create .env if not exists
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "AVISO: Configure o arquivo .env com suas credenciais"
  fi
fi

# 8. Certbot prep
echo "[7/7] Preparando SSL..."
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
echo "  2. Configure o .env (OBRIGATORIO):"
echo "     nano $INSTALL_DIR/.env"
echo "     -> SUPABASE_URL e SUPABASE_SERVICE_KEY sao obrigatorios"
echo ""
echo "  3. Primeiro boot (infra base):"
echo "     cd $INSTALL_DIR"
echo "     docker compose up -d ollama chromadb redis"
echo ""
echo "  4. Baixe os modelos Ollama (~4.7GB + ~4.1GB):"
echo "     docker exec sophia-ollama ollama pull llama3.1:8b"
echo "     docker exec sophia-ollama ollama pull mistral:7b"
echo ""
echo "  5. Gere o certificado SSL:"
echo "     docker compose up -d nginx"
echo "     docker compose run --rm certbot certonly \\"
echo "       --webroot -w /var/www/certbot \\"
echo "       -d $DOMAIN --email $EMAIL \\"
echo "       --agree-tos --no-eff-email"
echo ""
echo "  6. Suba tudo:"
echo "     docker compose up -d"
echo ""
echo "  7. Verifique:"
echo "     docker compose ps"
echo "     docker compose logs -f sophia"
echo ""
echo "  8. Ingeste conhecimento na base:"
echo "     docker exec sophia-worker npm run ingest"
echo ""
echo "  9. Acesse o Command Center:"
echo "     https://$DOMAIN"
echo ""
echo "=========================================="
echo ""
echo "  COMANDOS UTEIS:"
echo "     docker compose ps          # ver status"
echo "     docker compose logs -f     # ver logs em tempo real"
echo "     docker compose restart     # reiniciar tudo"
echo "     docker compose down        # parar tudo"
echo "     docker exec sophia-ollama ollama list  # ver modelos"
echo ""
echo "=========================================="
