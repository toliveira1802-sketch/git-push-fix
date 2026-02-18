# Sophia Worker — IA Rainha da Doctor Auto

Sistema de IA para gestao de oficinas mecanicas premium.
Roda na VPS Hostinger KVM 8 via Docker.

## Arquitetura

```
┌─────────────────────────────────────────────┐
│              VPS (Docker)                    │
│                                             │
│  sophia ──────── Ollama (LLMs locais)       │
│    │                 llama3.1:8b             │
│    │                 mistral:7b              │
│    │                                        │
│    ├──────── ChromaDB (RAG/vetores)         │
│    ├──────── Redis (filas/cache/pub-sub)    │
│    └──────── Supabase (banco remoto)        │
│                                             │
│  bot-sql ──── Ollama (query natural→SQL)    │
│  command-center ── React UI (porta 5174)    │
│  nginx ──── SSL + reverse proxy             │
│  certbot ── Let's Encrypt auto-renewal      │
└─────────────────────────────────────────────┘
```

## Servicos (8 containers)

| Servico | Container | Funcao |
|---------|-----------|--------|
| sophia | sophia-worker | IA Rainha - processa tasks e decisoes |
| bot-sql | sophia-bot-sql | Query engine linguagem natural → SQL |
| command-center | sophia-command-center | Dashboard React do diretor |
| ollama | sophia-ollama | LLMs locais (custo zero) |
| chromadb | sophia-chromadb | Base de conhecimento vetorial |
| redis | sophia-redis | Filas, cache, pub/sub |
| nginx | sophia-nginx | Reverse proxy + SSL |
| certbot | sophia-certbot | SSL auto-renewal |

## Deploy rapido

```bash
# 1. Na VPS (Ubuntu 22.04+)
bash deploy/setup-vps.sh ia.doctorauto.com.br admin@doctorauto.com.br

# 2. Copie os arquivos pro /opt/doctor-auto-ia/
scp -r tools/athena-worker/* user@vps:/opt/doctor-auto-ia/

# 3. Configure credenciais
nano /opt/doctor-auto-ia/.env

# 4. Suba infra base
docker compose up -d ollama chromadb redis

# 5. Baixe modelos
docker exec sophia-ollama ollama pull llama3.1:8b
docker exec sophia-ollama ollama pull mistral:7b

# 6. SSL
docker compose up -d nginx
docker compose run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d ia.doctorauto.com.br --email admin@doctorauto.com.br \
  --agree-tos --no-eff-email

# 7. Suba tudo
docker compose up -d

# 8. Ingeste conhecimento
docker exec sophia-worker npm run ingest
```

## Comandos uteis

```bash
docker compose ps                    # status dos containers
docker compose logs -f sophia        # logs da Sophia em tempo real
docker compose logs -f bot-sql       # logs do Bot SQL
docker compose restart sophia        # reiniciar Sophia
docker compose down                  # parar tudo
docker exec sophia-ollama ollama list  # ver modelos instalados
docker exec sophia-redis redis-cli info  # stats do Redis
```

## Variaveis de ambiente (.env)

| Variavel | Obrigatoria | Descricao |
|----------|-------------|-----------|
| SUPABASE_URL | Sim | URL do projeto Supabase |
| SUPABASE_SERVICE_KEY | Sim | Service Role Key (nao a anon key) |
| SOPHIA_MODEL | Nao | Modelo Ollama (default: llama3.1:8b) |
| OLLAMA_URL | Nao | URL do Ollama (default: http://ollama:11434) |
| ANTHROPIC_API_KEY | Nao | Claude API key (fallback) |
| FORCE_CLAUDE | Nao | Forcar uso do Claude (default: false) |
| CHROMA_URL | Nao | URL do ChromaDB (default: http://chromadb:8000) |
| REDIS_URL | Nao | URL do Redis (default: redis://redis:6379) |
| POLL_INTERVAL_MS | Nao | Intervalo de polling (default: 5000) |
| DOMAIN | Nao | Dominio para SSL |

## Seguranca

- Todas as portas internas (Ollama, Redis, ChromaDB) sao `127.0.0.1` only
- Nginx bloqueia acesso direto a Ollama, ChromaDB e Redis
- Rate limiting: 30 req/min API, 10 req/min SQL
- Bot SQL so executa SELECT (bloqueio de INSERT/UPDATE/DELETE/DROP)
- Firewall (ufw): apenas SSH, HTTP e HTTPS
- SSL via Let's Encrypt com auto-renewal
- Command Center acessivel apenas via HTTPS
