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

# ── Boas-vindas ────────────────────────────────────────────────────────────
echo -e "
   ${BOLD}${GREEN}${DIM}───────────────────────────────────────────────────────                                                                  
    ░█▀█░█▀▀░█▀▄░▀█▀░█▀▄░█▀█░░░█▀▀░█▀█░█▀▀░▀█▀░█░░
    ░█▀▀░█▀▀░█░█░░█░░█░█░█░█░░░█▀▀░█▀█░█░░░░█░░█░░
    ░▀░░░▀▀▀░▀▀░░▀▀▀░▀▀░░▀▀▀░░░▀░░░▀░▀░▀▀▀░▀▀▀░▀▀▀
    
    Instalação do PedidoFácil
    Este assistente prepara o ambiente na primeira execução.
    ${DIM}───────────────────────────────────────────────────────${RESET}"
# ── Pré-requisitos ─────────────────────────────────────────────────────────
echo -e "${BOLD}  Verificando dependências...${RESET}"
echo ""
if ! command -v docker &>/dev/null; then
  erro "Docker não encontrado."
  echo -e "     Instale-o em: ${BLUE}https://docs.docker.com/get-docker/${RESET}"
  exit 1
fi
ok "Docker encontrado"

if ! command -v node &>/dev/null; then
  erro "Node.js não encontrado."
  echo -e "     Instale em: ${BLUE}https://nodejs.org/${RESET}"
  exit 1
fi
ok "Node.js encontrado"
echo ""

# ── Configuração do .env ───────────────────────────────────────────────────
echo -e "${BOLD}  Configurando as variáveis do sistema...${RESET}"
echo ""

update_env() {
  local file="$1" key="$2" value="$3"
  local tmpfile
  tmpfile=$(mktemp)
  while IFS= read -r line || [[ -n "$line" ]]; do
    if [[ "$line" =~ ^${key}= ]]; then
      printf '%s=%s\n' "$key" "$value"
    else
      printf '%s\n' "$line"
    fi
  done < "$file" > "$tmpfile"
  mv "$tmpfile" "$file"
}

# Backend .env
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  info "Arquivo backend/.env criado"
fi

# Pede usuário do banco
DB_USER_CURRENT=$(grep "^DB_USER=" backend/.env | cut -d= -f2)
if [ -z "$DB_USER_CURRENT" ]; then
  echo -e "  ${BOLD}Usuário do banco de dados${RESET} ${DIM}(normalmente 'root' em ambiente local)${RESET}"
  read -p "  → Usuário [root]: " DB_USER_INPUT
  DB_USER_INPUT="${DB_USER_INPUT:-root}"
  update_env backend/.env "DB_USER" "$DB_USER_INPUT"
  ok "Usuário do banco configurado"
fi

# Pede senha do banco
DB_PASS_CURRENT=$(grep "^DB_PASS=" backend/.env | cut -d= -f2)
if [ -z "$DB_PASS_CURRENT" ]; then
  echo ""
  echo -e "  ${BOLD}Senha do banco de dados${RESET}"
  read -s -p "  → Senha: " DB_PASS_INPUT
  echo ""
  if [ -z "$DB_PASS_INPUT" ]; then
    erro "A senha do banco não pode ser vazia."
    exit 1
  fi
  update_env backend/.env "DB_PASS" "$DB_PASS_INPUT"
  ok "Senha do banco configurada"
fi

# Gera JWT_SECRET automaticamente se estiver vazio
JWT_CURRENT=$(grep "^JWT_SECRET=" backend/.env | cut -d= -f2)
if [ -z "$JWT_CURRENT" ]; then
  JWT_GENERATED=$(openssl rand -base64 32)
  update_env backend/.env "JWT_SECRET" "$JWT_GENERATED"
  ok "Chave de segurança JWT gerada automaticamente"
fi

# Pede token MercadoPago (assinatura)
MP_TOKEN_CURRENT=$(grep "^MERCADOPAGO_ACCESS_TOKEN_ASSINATURA=" backend/.env | cut -d= -f2)
if [ -z "$MP_TOKEN_CURRENT" ]; then
  echo ""
  echo -e "  ${BOLD}Token de acesso MercadoPago${RESET} ${DIM}(para cobranças de assinatura)${RESET}"
  echo -e "  ${DIM}Encontre em: mercadopago.com.br → Sua conta → Credenciais → Produção${RESET}"
  read -p "  → MERCADOPAGO_ACCESS_TOKEN_ASSINATURA: " MP_TOKEN_INPUT
  if [ -z "$MP_TOKEN_INPUT" ]; then
    erro "Token MercadoPago obrigatório."
    exit 1
  fi
  update_env backend/.env "MERCADOPAGO_ACCESS_TOKEN_ASSINATURA" "$MP_TOKEN_INPUT"
  ok "Token MercadoPago configurado"
fi

# Pede credenciais de e-mail (opcional — esqueci senha e contato não funcionarão sem isso)
MAIL_USER_CURRENT=$(grep "^MAIL_USER=" backend/.env | cut -d= -f2)
MAIL_PASS_CURRENT=$(grep "^MAIL_PASS=" backend/.env | cut -d= -f2)
if [ -z "$MAIL_USER_CURRENT" ] || [ -z "$MAIL_PASS_CURRENT" ]; then
  echo ""
  echo -e "  ${BOLD}E-mail${RESET} ${DIM}(opcional — necessário para 'Esqueci minha senha' e formulário de contato)${RESET}"
  read -p "  → MAIL_USER [Enter para pular]: " MAIL_USER_INPUT
  if [ -n "$MAIL_USER_INPUT" ]; then
    echo -e "  ${DIM}Use uma senha de app para Gmail${RESET}"
    read -s -p "  → MAIL_PASS: " MAIL_PASS_INPUT
    echo ""
    if [ -n "$MAIL_PASS_INPUT" ]; then
      update_env backend/.env "MAIL_USER" "$MAIL_USER_INPUT"
      update_env backend/.env "MAIL_PASS" "$MAIL_PASS_INPUT"
      ok "E-mail configurado"
    else
      warn "Senha não informada — e-mail não configurado. Configure MAIL_USER e MAIL_PASS em backend/.env quando quiser."
    fi
  else
    warn "E-mail não configurado. Configure MAIL_USER e MAIL_PASS em backend/.env quando quiser."
  fi
fi

# Web .env
if [ ! -f web/.env ]; then
  cp web/.env.example web/.env
  ok "Arquivo web/.env criado"
fi

MP_KEY_CURRENT=$(grep "^VITE_MP_PUBLIC_KEY=" web/.env | cut -d= -f2)
if [ -z "$MP_KEY_CURRENT" ]; then
  echo ""
  echo -e "  ${BOLD}Chave pública do MercadoPago${RESET} ${DIM}(necessária para pagamentos no site)${RESET}"
  echo -e "  ${DIM}Encontre em: mercadopago.com.br → Sua conta → Credenciais${RESET}"
  read -p "  → VITE_MP_PUBLIC_KEY: " MP_KEY_INPUT
  if [ -n "$MP_KEY_INPUT" ]; then
    update_env web/.env "VITE_MP_PUBLIC_KEY" "$MP_KEY_INPUT"
    ok "Chave MercadoPago configurada"
  else
    erro "Chave MercadoPago não informada. Configure VITE_MP_PUBLIC_KEY em web/.env e rode ./up.sh."
    exit 1
  fi
fi

echo ""

# ── Instalando dependências ────────────────────────────────────────────────
echo -e "${BOLD}  Instalando dependências do projeto...${RESET}"
echo -e "  ${DIM}(Isso pode levar alguns minutos na primeira vez)${RESET}"
echo ""

info "Backend..."
npm install --prefix backend --silent
ok "Backend pronto"

info "Web..."
npm install --prefix web --silent
ok "Web pronta"

info "Mobile..."
npm install --prefix mobile --silent
ok "Mobile pronto"

echo ""

# ── Banco de dados ─────────────────────────────────────────────────────────
echo -e "${BOLD}  Preparando o banco de dados...${RESET}"
echo ""

info "Iniciando containers Docker..."
docker compose -f backend/docker-compose.yml up -d mysql minio

echo ""
info "Aguardando o banco de dados ficar pronto..."
DB_PASS=$(grep "^DB_PASS=" backend/.env | cut -d= -f2)
TRIES=0
until docker exec pedido_facil_mysql mysqladmin ping -u root -p"$DB_PASS" --silent 2>/dev/null; do
  TRIES=$((TRIES+1))
  if [ $TRIES -gt 30 ]; then
    erro "O banco não respondeu após 60 segundos. Verifique se o Docker está rodando."
    exit 1
  fi
  printf "."
  sleep 2
done
echo ""
ok "Banco de dados pronto"

info "Criando as tabelas do sistema..."
DB_USER_INIT=$(grep "^DB_USER=" backend/.env | cut -d= -f2)
DB_NAME_INIT=$(grep "^DB_NAME=" backend/.env | cut -d= -f2)
if ! docker exec -i pedido_facil_mysql mysql -u"$DB_USER_INIT" -p"$DB_PASS" "$DB_NAME_INIT" < backend/init_db.sql; then
  erro "Falha ao criar as tabelas. Verifique os logs acima."
  exit 1
fi
ok "Tabelas criadas"

echo ""

# ── Concluído ──────────────────────────────────────────────────────────────
echo ""
echo -e "  ${DIM}───────────────────────────────────────────────────────${RESET}"
echo ""
echo -e "  ${GREEN}${BOLD}Tudo configurado! ✓${RESET}"
echo ""
echo -e "  Execute ${BOLD}./up.sh${RESET} para iniciar o sistema."
echo ""
