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

fill_from_example() {
  local example="$1" target="$2"
  while IFS= read -r line || [[ -n "$line" ]]; do
    if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.+)$ ]]; then
      local key="${BASH_REMATCH[1]}" value="${BASH_REMATCH[2]}"
      local current
      current=$(grep "^${key}=" "$target" 2>/dev/null | cut -d= -f2-)
      if [ -z "$current" ]; then
        if grep -q "^${key}=" "$target" 2>/dev/null; then
          update_env "$target" "$key" "$value"
        fi
      fi
    fi
  done < "$example"
}


if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  info "Arquivo backend/.env criado a partir do .env.example"
else
  fill_from_example backend/.env.example backend/.env
  info "Valores padrão aplicados ao backend/.env"
fi

if [ ! -f web/.env ]; then
  cp web/.env.example web/.env
  info "Arquivo web/.env criado a partir do .env.example"
else
  fill_from_example web/.env.example web/.env
fi


JWT_CURRENT=$(grep "^JWT_SECRET=" backend/.env | cut -d= -f2)
if [ -z "$JWT_CURRENT" ]; then
  update_env backend/.env "JWT_SECRET" "$(openssl rand -base64 32)"
  ok "Chave de segurança JWT gerada"
fi

echo ""
echo -e "  ${BOLD}Como deseja configurar as variáveis de ambiente?${RESET}"
echo ""
echo -e "  ${BOLD}[1]${RESET} Usar os valores padrão do .env.example ${DIM}(recomendado para desenvolvimento)${RESET}"
echo -e "  ${BOLD}[2]${RESET} Configurar manualmente agora ${DIM}(token MercadoPago, e-mail etc.)${RESET}"
echo ""
read -p "  → Escolha [1]: " ENV_CHOICE
ENV_CHOICE="${ENV_CHOICE:-1}"
echo ""

if [ "$ENV_CHOICE" = "2" ]; then

  echo -e "  Os arquivos ${BOLD}backend/.env${RESET} e ${BOLD}web/.env${RESET} já foram criados."
  echo ""
  echo -e "  ${BOLD}Próximos passos:${RESET}"
  echo ""
  echo -e "    1. Leia o ${BOLD}README.md na seção 2.1 ${RESET} para instruções para obter cada variável"
  echo -e "    2. Edite ${BOLD}backend/.env${RESET} com seus valores ${DIM}(token MP, e-mail, porta etc.)${RESET}"
  echo -e "    3. Edite ${BOLD}web/.env${RESET} com sua chave pública do MercadoPago"
  echo -e "    4. Execute ${BOLD}./up.sh${RESET} para iniciar o sistema"
  echo ""
  exit 0

else
  ok "Usando valores padrão do .env.example"
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

DB_PORT_CHECK=$(grep "^DB_PORT=" backend/.env | cut -d= -f2)
DB_PORT_CHECK="${DB_PORT_CHECK:-3306}"

if nc -z localhost "$DB_PORT_CHECK" 2>/dev/null; then
  if ! docker ps --format '{{.Names}}' 2>/dev/null | grep -q 'pedido_facil_mysql'; then
    erro "Porta ${DB_PORT_CHECK} já está em uso por outro serviço. Altere DB_PORT em backend/.env e tente novamente."
    exit 1
  fi
fi

info "Iniciando containers Docker..."
docker compose -f backend/docker-compose.yml up -d mysql minio

echo ""
info "Aguardando o banco de dados ficar pronto..."
DB_PASS=$(grep "^DB_PASS=" backend/.env | cut -d= -f2)
DB_USER_INIT=$(grep "^DB_USER=" backend/.env | cut -d= -f2)
DB_NAME_INIT=$(grep "^DB_NAME=" backend/.env | cut -d= -f2)
TRIES=0
until docker exec -e MYSQL_PWD="$DB_PASS" pedido_facil_mysql mysqladmin ping -u root --silent 2>/dev/null; do
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

TABLE_COUNT=$(docker exec -e MYSQL_PWD="$DB_PASS" pedido_facil_mysql \
  mysql -u"$DB_USER_INIT" -N -e \
  "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='${DB_NAME_INIT}';" 2>/dev/null | tail -1)

if [ "${TABLE_COUNT:-0}" -gt 0 ]; then
  echo ""
  warn "O banco '${DB_NAME_INIT}' já possui ${TABLE_COUNT} tabela(s)."
  echo ""
  echo -e "  ${BOLD}[1]${RESET} Manter o banco atual e continuar ${DIM}(padrão)${RESET}"
  echo -e "  ${BOLD}[2]${RESET} Apagar tudo e recriar do zero ${DIM}(⚠ todos os dados serão perdidos)${RESET}"
  echo ""
  read -p "  → Escolha [1]: " DB_CHOICE
  DB_CHOICE="${DB_CHOICE:-1}"
  echo ""

  if [ "$DB_CHOICE" = "2" ]; then
    warn "Apagando banco '${DB_NAME_INIT}'..."
    docker exec -e MYSQL_PWD="$DB_PASS" pedido_facil_mysql \
      mysql -u root -e "DROP DATABASE IF EXISTS \`${DB_NAME_INIT}\`; CREATE DATABASE \`${DB_NAME_INIT}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    info "Criando as tabelas do sistema..."
    if ! docker exec -i -e MYSQL_PWD="$DB_PASS" pedido_facil_mysql mysql -u"$DB_USER_INIT" "$DB_NAME_INIT" < backend/init_db.sql; then
      erro "Falha ao criar as tabelas. Verifique os logs acima."
      exit 1
    fi
    ok "Banco recriado com sucesso"
  else
    ok "Banco mantido — nenhuma alteração feita"
  fi
else
  info "Criando as tabelas do sistema..."
  if ! docker exec -i -e MYSQL_PWD="$DB_PASS" pedido_facil_mysql mysql -u"$DB_USER_INIT" "$DB_NAME_INIT" < backend/init_db.sql; then
    erro "Falha ao criar as tabelas. Verifique os logs acima."
    exit 1
  fi
  ok "Tabelas criadas"
fi

echo ""

# ── Concluído ──────────────────────────────────────────────────────────────
BACKEND_PORT=$(grep "^PORT=" backend/.env | cut -d= -f2)
BACKEND_PORT="${BACKEND_PORT:-3000}"
DB_PORT_SHOW=$(grep "^DB_PORT=" backend/.env | cut -d= -f2)
DB_PORT_SHOW="${DB_PORT_SHOW:-3306}"

echo ""
echo -e "  ${DIM}───────────────────────────────────────────────────────${RESET}"
echo ""
echo -e "  ${GREEN}${BOLD}Tudo configurado! ✓${RESET}"
echo ""
echo -e "  ${BOLD}Portas do sistema:${RESET}"
echo ""
echo -e "    ${BOLD}:5173${RESET}            ${DIM}← site (web)${RESET}"
echo -e "    ${BOLD}:${BACKEND_PORT}${RESET}            ${DIM}← backend (API)${RESET}"
echo -e "    ${BOLD}:${DB_PORT_SHOW}${RESET}           ${DIM}← MySQL (Docker)${RESET}"
echo -e "    ${BOLD}:4566${RESET}            ${DIM}← MinIO / uploads (Docker)${RESET}"
echo -e "    ${BOLD}:9001${RESET}            ${DIM}← MinIO painel admin (Docker)${RESET}"
echo ""
echo -e "  Execute ${BOLD}./up.sh${RESET} para iniciar o sistema."
echo ""
