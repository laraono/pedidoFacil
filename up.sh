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

trap 'echo -e "\n  ${RED}✗${RESET}  Ocorreu um erro inesperado. Verifique os logs acima.\n"' ERR

# ── Cabeçalho ──────────────────────────────────────────────────────────────
echo -e "
   ${BOLD}${GREEN}${DIM}───────────────────────────────────────────────────────
    ░█▀█░█▀▀░█▀▄░▀█▀░█▀▄░█▀█░░░█▀▀░█▀█░█▀▀░▀█▀░█░░
    ░█▀▀░█▀▀░█░█░░█░░█░█░█░█░░░█▀▀░█▀█░█░░░░█░░█░░
    ░▀░░░▀▀▀░▀▀░░▀▀▀░▀▀░░▀▀▀░░░▀░░░▀░▀░▀▀▀░▀▀▀░▀▀▀

    Bem vindo!
    Com esse assistente, o sistema iniciará a execução.
    ${DIM}───────────────────────────────────────────────────────${RESET}"

# ── Verifica pré-requisitos ────────────────────────────────────────────────
echo -e "${BOLD}  Verificando configurações...${RESET}"
echo ""

if [ ! -f backend/.env ]; then
  erro "Arquivo backend/.env não encontrado."
  echo -e "     Execute ${BOLD}./install.sh${RESET} primeiro para configurar o sistema."
  exit 1
fi

if ! docker info &>/dev/null; then
  erro "Docker não está rodando."
  echo -e "     Abra o Docker Desktop e tente novamente."
  exit 1
fi

REQUIRED_VARS=("DB_HOST" "DB_PORT" "DB_USER" "DB_PASS" "DB_NAME" "JWT_SECRET" "MERCADOPAGO_ACCESS_TOKEN_ASSINATURA")
MISSING=()
for var in "${REQUIRED_VARS[@]}"; do
  value=$(grep "^${var}=" backend/.env | cut -d= -f2)
  [ -z "$value" ] && MISSING+=("$var")
done

if [ ${#MISSING[@]} -gt 0 ]; then
  erro "Variáveis obrigatórias faltando em backend/.env:"
  for var in "${MISSING[@]}"; do
    echo -e "     ${YELLOW}•${RESET} $var"
  done
  echo ""
  echo -e "  Edite ${BOLD}backend/.env${RESET} e rode ${BOLD}./up.sh${RESET} novamente."
  exit 1
fi

MAIL_USER_VAL=$(grep "^MAIL_USER=" backend/.env | cut -d= -f2)
MAIL_PASS_VAL=$(grep "^MAIL_PASS=" backend/.env | cut -d= -f2)
if [ -z "$MAIL_USER_VAL" ] || [ -z "$MAIL_PASS_VAL" ]; then
  warn "E-mail não configurado — 'Esqueci minha senha' e contato ficarão desabilitados."
fi

ok "Configurações verificadas"

# ── Checagem de portas ─────────────────────────────────────────────────────
DB_PORT_CHECK=$(grep "^DB_PORT=" backend/.env | cut -d= -f2)
DB_PORT_CHECK="${DB_PORT_CHECK:-3306}"

if nc -z localhost "$DB_PORT_CHECK" 2>/dev/null; then
  if ! docker ps --format '{{.Names}}' 2>/dev/null | grep -q 'pedido_facil_mysql'; then
    erro "Porta ${DB_PORT_CHECK} já está em uso. Altere DB_PORT em backend/.env e tente novamente."
    exit 1
  fi
fi

if nc -z localhost 5173 2>/dev/null; then
  if ! docker ps --format '{{.Names}}' 2>/dev/null | grep -q 'pedido_facil_web'; then
    erro "Porta 5173 já está em uso. Encerre o processo antes de continuar."
    exit 1
  fi
fi

# ── Subindo containers ─────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}  Subindo containers...${RESET}"
echo ""

VITE_MP_PUBLIC_KEY=$(grep "^VITE_MP_PUBLIC_KEY=" web/.env 2>/dev/null | cut -d= -f2)
VITE_MP_PUBLIC_KEY="$VITE_MP_PUBLIC_KEY" docker compose --env-file backend/.env up -d

echo ""
ok "Todos os containers no ar"

# ── Mobile ─────────────────────────────────────────────────────────────────
BACKEND_PORT=$(grep "^PORT=" backend/.env | cut -d= -f2)
BACKEND_PORT="${BACKEND_PORT:-3000}"

LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
[ -z "$LOCAL_IP" ] && LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || echo "localhost")
MOBILE_URL="http://${LOCAL_IP}:${BACKEND_PORT}"
echo "EXPO_PUBLIC_API_URL=${MOBILE_URL}" > mobile/.env

# ── Resultado ──────────────────────────────────────────────────────────────
echo ""
echo -e "  ${DIM}───────────────────────────────────────────────────────${RESET}"
echo ""
echo -e "  ${GREEN}${BOLD}Sistema no ar! ✓${RESET}"
echo ""
echo -e "  ${BOLD}http://localhost:5173${RESET}       ${DIM}← site${RESET}"
echo -e "  ${BOLD}http://localhost:${BACKEND_PORT}${RESET}         ${DIM}← backend (API)${RESET}"
echo -e "  ${BOLD}http://localhost:9001${RESET}       ${DIM}← MinIO painel admin${RESET}"
echo ""
echo -e "  ${BOLD}Admin:${RESET}  admin@admin.com  /  Admin@123"
echo ""
echo -e "  ${BOLD}Mobile (Expo Go):${RESET}"
echo -e "    ${DIM}API configurada:${RESET} ${BOLD}${MOBILE_URL}${RESET}"
echo -e "    Para iniciar: ${BOLD}npm run start --prefix mobile${RESET}"
echo ""
echo -e "  Para encerrar: ${BOLD}docker compose --env-file backend/.env down${RESET}"
echo ""
echo -e "  ${DIM}───────────────────────────────────────────────────────${RESET}"
echo ""
