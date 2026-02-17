#!/bin/bash
# =============================================
# SETUP VPS - Doctor Auto IA Mae (Athena)
# Hostinger KVM 8 - Ubuntu 22.04+
# 8vCPU, 32GB RAM, 400GB SSD
# =============================================

set -e

echo "=========================================="
echo "  Doctor Auto - Setup VPS IA"
echo "=========================================="

# 1. System update
echo "[1/7] Atualizando sistema..."
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 22 LTS
echo "[2/7] Instalando Node.js 22..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt install -y nodejs
fi
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"

# 3. Install Ollama
echo "[3/7] Instalando Ollama..."
if ! command -v ollama &> /dev/null; then
  curl -fsSL https://ollama.com/install.sh | sh
fi
echo "Ollama instalado"

# Pull models
echo "Baixando modelos LLM..."
ollama pull llama3.1:8b &
ollama pull mistral:7b &
wait
echo "Modelos baixados"

# 4. Install ChromaDB via pip
echo "[4/7] Instalando ChromaDB..."
sudo apt install -y python3-pip python3-venv
if ! command -v chroma &> /dev/null; then
  pip3 install chromadb
fi
echo "ChromaDB instalado"

# 5. Create project directory
echo "[5/7] Criando estrutura do projeto..."
INSTALL_DIR="/opt/doctor-auto-ia"
sudo mkdir -p $INSTALL_DIR
sudo chown $(whoami):$(whoami) $INSTALL_DIR

# 6. Copy worker files (assumes git clone or scp already done)
echo "[6/7] Configurando worker..."
cd $INSTALL_DIR

if [ ! -f "package.json" ]; then
  echo "AVISO: Copie os arquivos do athena-worker para $INSTALL_DIR"
  echo "  scp -r tools/athena-worker/* user@vps:$INSTALL_DIR/"
fi

# Install dependencies
if [ -f "package.json" ]; then
  npm install --production
  npm run build
fi

# 7. Create .env if not exists
if [ ! -f ".env" ]; then
  cp .env.example .env 2>/dev/null || true
  echo "AVISO: Configure o arquivo .env em $INSTALL_DIR/.env"
fi

echo ""
echo "=========================================="
echo "  Setup concluido!"
echo "=========================================="
echo ""
echo "Proximos passos:"
echo "  1. Configure o .env: nano $INSTALL_DIR/.env"
echo "  2. Instale o servico: sudo cp deploy/athena-worker.service /etc/systemd/system/"
echo "  3. Inicie: sudo systemctl enable athena-worker && sudo systemctl start athena-worker"
echo "  4. Inicie ChromaDB: sudo systemctl enable chromadb && sudo systemctl start chromadb"
echo "  5. Execute ingestao: cd $INSTALL_DIR && npm run ingest"
echo ""
