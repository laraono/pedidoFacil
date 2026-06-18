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
   ${BOLD}${RED}${DIM}───────────────────────────────────────────────────────
    ░█▀█░█▀▀░█▀▄░▀█▀░█▀▄░█▀█░░░█▀▀░█▀█░█▀▀░▀█▀░█░░
    ░█▀▀░█▀▀░█░█░░█░░█░█░█░█░░░█▀▀░█▀█░█░░░░█░░█░░
    ░▀░░░▀▀▀░▀▀░░▀▀▀░▀▀░░▀▀▀░░░▀░░░▀░▀░▀▀▀░▀▀▀░▀▀▀

    Encerrando o sistema...
    ${DIM}───────────────────────────────────────────────────────${RESET}"

# ── Verifica se Docker está rodando ───────────────────────────────────────
if ! docker info &>/dev/null; then
  erro "Docker não está rodando."
  exit 1
fi

# ── Verifica containers ativos ─────────────────────────────────────────────
RUNNING=$(docker ps --format '{{.Names}}' | grep 'pedido_facil' || true)

if [ -z "$RUNNING" ]; then
  warn "Nenhum container do PedidoFácil está rodando."
  echo ""
  exit 0
fi

echo ""
echo -e "${BOLD}  Containers ativos:${RESET}"
echo "$RUNNING" | while read -r name; do
  echo -e "  ${YELLOW}•${RESET}  $name"
done
echo ""

# ── Pergunta sobre volumes ─────────────────────────────────────────────────
echo -e "  ${BOLD}Deseja apagar os dados do banco e MinIO? (volumes)${RESET}"
echo -e "  ${DIM}Responda 'não' para apenas parar — os dados persistem.${RESET}"
echo ""
echo -e "  [s] Sim, apagar tudo   [N] Não, só parar"
echo ""
read -rp "  Escolha [N]: " RESPOSTA
RESPOSTA="${RESPOSTA:-N}"

echo ""

# ── Derruba os containers ──────────────────────────────────────────────────
if [[ "$RESPOSTA" =~ ^[Ss]$ ]]; then
  warn "Apagando containers e volumes (banco e MinIO serão zerados)..."
  echo ""
  docker compose --env-file backend/.env down --volumes
  echo ""
  ok "Containers e volumes removidos"
else
  info "Parando containers (dados preservados)..."
  echo ""
  docker compose --env-file backend/.env down
  echo ""
  ok "Containers encerrados — dados preservados nos volumes"
fi

# ── Resultado ──────────────────────────────────────────────────────────────
echo ""
echo -e "  ${DIM}───────────────────────────────────────────────────────${RESET}"
echo ""
echo -e "  ${BOLD}Sistema encerrado.${RESET}"
echo ""
echo -e "  Para subir novamente: ${BOLD}./up.sh${RESET}"
echo ""
echo -e "  ${DIM}───────────────────────────────────────────────────────${RESET}"
echo ""
