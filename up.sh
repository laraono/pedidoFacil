#!/bin/bash
set -e

# ── Cores ──────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'

ok()   { echo -e "  ${GREEN}✓${RESET}  $1"; }
info() { echo -e "  ${BLUE}→${RESET}  $1"; }
warn() { echo -e "  ${YELLOW}!${RESET}  $1"; }
erro() { echo -e "  ${RED}✗${RESET}  $1"; }

# ── Cabeçalho ──────────────────────────────────────────────────────────────
echo -e "
   ${BOLD}${GREEN}${DIM}───────────────────────────────────────────────────────                                                                  
    ░█▀█░█▀▀░█▀▄░▀█▀░█▀▄░█▀█░░░█▀▀░█▀█░█▀▀░▀█▀░█░░
    ░█▀▀░█▀▀░█░█░░█░░█░█░█░█░░░█▀▀░█▀█░█░░░░█░░█░░
    ░▀░░░▀▀▀░▀▀░░▀▀▀░▀▀░░▀▀▀░░░▀░░░▀░▀░▀▀▀░▀▀▀░▀▀▀
    
    Bem vindo novamente!                                                                         
    Com esse assistente, o sistema iniciará a execução.
    ${DIM}───────────────────────────────────────────────────────${RESET}"
# ── Verifica .env ──────────────────────────────────────────────────────────
echo -e "${BOLD}  Verificando configurações...${RESET}"
echo ""

if [ ! -f backend/.env ]; then
  erro "Arquivo backend/.env não encontrado."
  echo -e "     Execute ${BOLD}./install.sh${RESET} primeiro para configurar o sistema."
  exit 1
fi

REQUIRED_VARS=("DB_HOST" "DB_PORT" "DB_USER" "DB_PASS" "DB_NAME" "JWT_SECRET")
MISSING=()

for var in "${REQUIRED_VARS[@]}"; do
  value=$(grep "^${var}=" backend/.env | cut -d= -f2)
  if [ -z "$value" ]; then
    MISSING+=("$var")
  fi
done

if [ ${#MISSING[@]} -gt 0 ]; then
  erro "Algumas configurações obrigatórias estão faltando no backend/.env:"
  echo ""
  for var in "${MISSING[@]}"; do
    echo -e "     ${YELLOW}•${RESET} $var"
  done
  echo ""
  echo -e "  Abra o arquivo ${BOLD}backend/.env${RESET} e preencha os valores em falta."
  echo -e "  Depois rode ${BOLD}./up.sh${RESET} novamente."
  exit 1
fi

ok "Configurações ok"

# ── Docker ─────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}  Iniciando o banco de dados...${RESET}"
echo ""

if ! docker info &>/dev/null; then
  erro "Docker não está rodando."
  echo -e "     Abra o Docker Desktop e tente novamente."
  exit 1
fi

docker compose -f backend/docker-compose.yml up -d mysql localstack

DB_PASS=$(grep "^DB_PASS=" backend/.env | cut -d= -f2)
info "Aguardando banco de dados..."
TRIES=0
until docker exec pedido_facil_mysql mysqladmin ping -u root -p"$DB_PASS" --silent 2>/dev/null; do
  TRIES=$((TRIES+1))
  if [ $TRIES -gt 20 ]; then
    erro "Banco não respondeu. Verifique se o Docker está saudável."
    exit 1
  fi
  printf "."
  sleep 2
done
echo ""
ok "Banco de dados pronto"

# ── Iniciando serviços ─────────────────────────────────────────────────────
BACKEND_PORT=$(grep "^PORT=" backend/.env | cut -d= -f2)
BACKEND_PORT="${BACKEND_PORT:-3000}"

mkdir -p logs

info "Iniciando servidor backend..."
npm run dev --prefix backend > logs/backend.log 2>&1 &
BACKEND_PID=$!

info "Iniciando site..."
npm run dev --prefix web > logs/web.log 2>&1 &
WEB_PID=$!

info "Iniciando mobile (Expo)..."
npm run start --prefix mobile > logs/mobile.log 2>&1 &
MOBILE_PID=$!

# Para tudo quando a pessoa pressionar Ctrl+C
trap 'echo ""; info "Encerrando..."; kill $BACKEND_PID $WEB_PID $MOBILE_PID 2>/dev/null; wait $BACKEND_PID $WEB_PID $MOBILE_PID 2>/dev/null; docker compose -f backend/docker-compose.yml down; echo ""; ok "Tudo encerrado. Até logo!"; echo ""; exit 0' INT TERM

# Aguarda os serviços iniciarem
info "Aguardando serviços iniciarem..."
sleep 4

echo ""
echo -e "  ${DIM}───────────────────────────────────────────────────────${RESET}"
echo ""
echo -e "  ${GREEN}${BOLD}Sistema no ar! ✓${RESET}"
echo ""
echo -e "  Acesse no navegador:"
echo ""
echo -e "    ${BOLD}${YELLOW}http://localhost:5173${RESET}       ${DIM}← site principal${RESET}"
echo -e "    ${BOLD}${BLUE}http://localhost:${BACKEND_PORT}${RESET}         ${DIM}← backend (API)${RESET}"
echo ""
echo -e "  ${DIM}O QR code do Expo está em logs/mobile.log — escaneie com o Expo Go.${RESET}"
echo ""
echo -e "  ${DIM}Logs: logs/backend.log · logs/web.log · logs/mobile.log${RESET}"
echo ""
echo -e "  ${DIM}Pressione Ctrl+C para encerrar tudo.${RESET}"
echo ""
echo -e "  ${DIM}───────────────────────────────────────────────────────${RESET}"
echo ""

# Mantém o script vivo até Ctrl+C
wait
