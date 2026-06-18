#!/bin/bash
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'

ok()   { echo -e "  ${GREEN}✓${RESET}  $1"; }
info() { echo -e "  ${BLUE}→${RESET}  $1"; }

echo -e "
   ${BOLD}${GREEN}${DIM}───────────────────────────────────────────────────────
    Build APK — PedidoFácil Mobile
    Gera o instalador Android via EAS Build (nuvem Expo).
    ${DIM}───────────────────────────────────────────────────────${RESET}"

cd mobile

if ! npx eas whoami &>/dev/null 2>&1; then
  echo ""
  echo -e "  Faça login na sua conta ${BOLD}expo.dev${RESET}:"
  echo -e "  ${DIM}(Crie uma conta gratuita em https://expo.dev se ainda não tiver)${RESET}"
  echo ""
  npx eas login
fi

EXPO_USER=$(npx eas whoami 2>/dev/null)
ok "Logado como: ${EXPO_USER}"

echo ""
info "Iniciando build APK (perfil: preview)..."
echo -e "  ${DIM}Isso pode levar 10–15 minutos na nuvem da Expo.${RESET}"
echo ""

npx eas build --platform android --profile preview

echo ""
ok "Build enviado!"
echo ""
echo -e "  ${BOLD}Próximos passos:${RESET}"
echo -e "    1. Aguarde o e-mail da Expo com o link de download"
echo -e "    2. Ou acesse ${BOLD}https://expo.dev${RESET} → Builds"
echo -e "    3. Baixe o ${BOLD}.apk${RESET} e distribua como quiser ${DIM}(WhatsApp, Drive, link direto...)${RESET}"
echo -e "    4. No Android: Configurações → Segurança → ${BOLD}Instalar de fontes desconhecidas${RESET}"
echo ""