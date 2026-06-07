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
    
    Bem vindo!                                                                         
    Com esse assistente, o sistema será preparado para execução.
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

# Web .env
if [ ! -f web/.env ]; then
  cp web/.env.example web/.env
  ok "Arquivo web/.env criado"
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
docker compose -f backend/docker-compose.yml up -d

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
cd backend && npm run migration:run 2>&1 | tail -1 && cd ..
ok "Tabelas criadas"

echo ""

# ── Primeiro acesso ────────────────────────────────────────────────────────
echo -e "${BOLD}  Criando o seu primeiro acesso ao sistema${RESET}"
echo ""
echo -e "  Você vai usar esses dados para entrar na plataforma"
echo -e "  como administrador pela primeira vez."
echo ""

read -p "  → Seu nome: " ADMIN_NAME
if [ -z "$ADMIN_NAME" ]; then
  erro "O nome não pode ser vazio."
  exit 1
fi

while true; do
  read -p "  → Seu e-mail: " ADMIN_EMAIL
  if [ -z "$ADMIN_EMAIL" ]; then
    erro "O e-mail não pode ser vazio."
  elif ! [[ "$ADMIN_EMAIL" =~ ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]]; then
    erro "E-mail inválido. Tente novamente."
  else
    break
  fi
done

echo ""
echo -e "  ${DIM}A senha precisa ter pelo menos 6 caracteres.${RESET}"

while true; do
  read -s -p "  → Crie uma senha: " ADMIN_PASS
  echo ""
  if [ ${#ADMIN_PASS} -lt 6 ]; then
    erro "A senha precisa ter pelo menos 6 caracteres."
    continue
  fi
  read -s -p "  → Repita a senha: " ADMIN_PASS_CONFIRM
  echo ""
  if [ "$ADMIN_PASS" != "$ADMIN_PASS_CONFIRM" ]; then
    erro "As senhas não coincidem. Tente novamente."
  else
    break
  fi
done

info "Criando acesso de administrador..."

export ADMIN_NAME ADMIN_EMAIL ADMIN_PASS DB_PASS
DB_USER=$(grep "^DB_USER=" backend/.env | cut -d= -f2)
DB_NAME=$(grep "^DB_NAME=" backend/.env | cut -d= -f2)
DB_PORT=$(grep "^DB_PORT=" backend/.env | cut -d= -f2)
export DB_USER DB_NAME DB_PORT

NODE_RESULT=$(node << 'EOF'
const bcrypt = require('./backend/node_modules/bcrypt');
const mysql2 = require('./backend/node_modules/mysql2/promise');

async function main() {
  const conn = await mysql2.createConnection({
    host: 'localhost',
    port: Number(process.env.DB_PORT) || 3307,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  const [rows] = await conn.execute(
    'SELECT ID_Admin FROM ADMIN WHERE Email = ?',
    [process.env.ADMIN_EMAIL]
  );

  if (rows.length > 0) {
    await conn.end();
    console.log('EXISTS');
    return;
  }

  const hash = await bcrypt.hash(process.env.ADMIN_PASS, 12);
  await conn.execute(
    'INSERT INTO ADMIN (Nome, Email, Senha) VALUES (?, ?, ?)',
    [process.env.ADMIN_NAME, process.env.ADMIN_EMAIL, hash]
  );

  await conn.end();
  console.log('CREATED');
}

main().catch(err => { console.error('ERRO:' + err.message); process.exit(1); });
EOF
)

if [ "$NODE_RESULT" = "CREATED" ]; then
  ok "Administrador criado com sucesso"
elif [ "$NODE_RESULT" = "EXISTS" ]; then
  echo ""
  warn "Já existe um administrador cadastrado com esse e-mail."
  echo ""
  read -p "  Deseja substituí-lo pelo novo? [s/N]: " REPLACE_ADMIN
  if [[ "$REPLACE_ADMIN" =~ ^[Ss]$ ]]; then
    export ADMIN_REPLACE=true
    NODE_RESULT2=$(node << 'EOF'
const bcrypt = require('./backend/node_modules/bcrypt');
const mysql2 = require('./backend/node_modules/mysql2/promise');

async function main() {
  const conn = await mysql2.createConnection({
    host: 'localhost',
    port: Number(process.env.DB_PORT) || 3307,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  await conn.execute('DELETE FROM ADMIN WHERE Email = ?', [process.env.ADMIN_EMAIL]);

  const hash = await bcrypt.hash(process.env.ADMIN_PASS, 12);
  await conn.execute(
    'INSERT INTO ADMIN (Nome, Email, Senha) VALUES (?, ?, ?)',
    [process.env.ADMIN_NAME, process.env.ADMIN_EMAIL, hash]
  );

  await conn.end();
  console.log('REPLACED');
}

main().catch(err => { console.error('ERRO:' + err.message); process.exit(1); });
EOF
    )
    if [ "$NODE_RESULT2" = "REPLACED" ]; then
      ok "Administrador substituído com sucesso"
    else
      erro "Não foi possível substituir o administrador: $NODE_RESULT2"
      exit 1
    fi
  else
    warn "Mantendo o administrador existente."
  fi
else
  erro "Não foi possível criar o administrador: $NODE_RESULT"
  exit 1
fi

# ── Concluído ──────────────────────────────────────────────────────────────
echo ""
echo -e "  ${DIM}───────────────────────────────────────────────────────${RESET}"
echo ""
echo -e "  ${GREEN}${BOLD}Tudo configurado! ✓${RESET}"
echo ""
echo -e "  Para iniciar o sistema, rode:"
echo ""
echo -e "    ${BOLD}./up.sh${RESET}"
echo ""
echo -e "  ${DIM}Guarde seu e-mail e senha — você vai precisar deles para entrar.${RESET}"
echo ""
