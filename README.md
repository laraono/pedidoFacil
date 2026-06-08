# PedidoFácil

O **PedidoFácil** é um sistema integrado para gestão de restaurantes e pequenos comércios. Ele oferece controle de pedidos em tempo real, cardápio digital com autoatendimento, gestão de caixa e comandas, relatórios e controle de assinaturas com foco em ser acessível para microempreendedores.

Este projeto foi desenvolvido como requisito para a obtenção do título de Tecnólogo em **Análise e Desenvolvimento de Sistemas** na **Universidade Federal do Paraná (UFPR)**.

**Orientador:** Razer Anthom Nizer Rojas Montaño

**Autores:**
- Gabriela Morais Gandine
- João Pedro Abreu
- Juliano da Silva Filho
- Lara Ono Glufke Reis

---

## Stack

| Camada | Tecnologias |
|---|---|
| Frontend Web | Vue 3 (Composition API) · TypeScript · Vite · Tailwind CSS · Socket.io |
| Mobile | React Native · Expo |
| Backend | Node.js · Express · TypeORM · Zod |
| Banco de Dados | MySQL |
| Infraestrutura | Docker · Docker Compose · LocalStack (AWS local — upload de imagens) |
| Integrações | MercadoPago (pagamentos e assinaturas) |

---

## Funcionalidades

### Landing Page & Onboarding
- Apresentação de planos e funcionalidades.
- Fluxo guiado de cadastro de gerente e estabelecimento.

### Administração do Sistema (Super Admin)
- Gestão de estabelecimentos, administradores e assinaturas vigentes.
- Criação e edição de planos disponíveis.
- Relatórios e métricas de desempenho.

### Gestão do Estabelecimento (Gerente)
- Cadastro e edição de produtos e categorias.
- Configuração de cargos e acessos por funcionário.
- Criação e controle de cupons de desconto.
- Histórico de pagamentos e administração da assinatura da plataforma.
- Configurações de dados e identidade visual do cardápio.
- Métricas de vendas, produtos e operação.

### Operação
- **Cardápio Digital:** pedidos via web ou aplicativo mobile (autoatendimento).
- **Módulo Cozinha:** fila de pedidos em tempo real.
- **Módulo Caixa:** gestão de comandas ativas, fluxo de pagamento e histórico de comandas fechadas.

---

## Como Executar

### Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) instalado e em execução.
- [Node.js LTS](https://nodejs.org/) instalado.

### 1. Clone o repositório

```bash
git clone https://github.com/laraono/pedidofacil.git
cd pedidofacil
```

### 2. Configure o ambiente

Preencha as credenciais do banco de dados em `backend/.env`. 

O `JWT_SECRET` é gerado automaticamente pelo script de instalação - não é necessário preencher manualmente.

As demais variáveis (`MERCADOPAGO_*`, `LOCALSTACK_TOKEN`, `MAIL_*`) podem ser obtidas pelas instruções da 2.1, ou, opcionalmente, devido a complexidade das configurações, o `.env.example` traz credenciais de teste criadas para este projeto, que podem ser usadas como alternativa para os tutoriais de configuração abaixo.

Para utilizá-los, execute:

```bash
cp backend/.env.example backend/.env
cp web/.env.example web/.env
```

### 2.1 Integrações

#### MercadoPago (assinaturas e pagamentos)

Necessário para o fluxo completo de planos e assinaturas.

##### Criando as contas de teste

1. Acesse a [documentação oficial de contas de teste](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/test/accounts) e crie **dois** usuários de teste: um **vendedor** e um **consumidor**.
2. Registre as credenciais de ambos, pois serão necessárias para autenticação.

##### Obtendo as credenciais

3. Acesse o MercadoPago **autenticado com a conta de vendedor de teste**.
4. Vá em **Suas integrações** e crie uma nova integração para essa conta.
5. Copie as credenciais e preencha em `backend/.env` e `web/.env`:

| Variável | Onde preencher |
|---|---|
| `MERCADOPAGO_ACCESS_TOKEN_ASSINATURA` | `backend/.env` |
| `MERCADOPAGO_USER_ID` | `backend/.env` |
| `VITE_MP_PUBLIC_KEY` | `web/.env` |

A documentação oficial de credenciais está em: https://www.mercadopago.com.br/developers/pt/docs/subscriptions/additional-content/your-integrations/credentials


##### Configurando Webhooks (opcional)

Os webhooks permitem que o MercadoPago notifique o sistema sobre renovações, cancelamentos e alterações em assinaturas.

Para receber webhooks localmente, é necessário expor o backend com uma URL pública. Recomenda-se o uso do [ngrok](https://ngrok.com/download/linux):

```bash
# Após instalar e autenticar o ngrok:
ngrok http 3000
```

O ngrok gerará uma URL pública (ex: `https://xxxx.ngrok.io`). Configure-a em `backend/.env`:

```
MP_BACK_URL=https://xxxx.ngrok.io
```

Em seguida, registre essa URL nas configurações de webhook da sua integração no MercadoPago, habilitando os eventos de **pagamentos**, **planos** e **assinaturas**. O tutorial oficial está na [etapa 1.4 desta documentação](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks#configuraoviasuasintegraes).

Para simular notificações sem aguardar eventos reais, é possível usar a opção de "Simular notificação" no painel do MercadoPago, ou cancelar diretamente uma assinatura na conta do consumidor de teste - a notificação aparecerá nos logs do backend.

---

#### LocalStack (upload de imagens)

Simula a AWS localmente para armazenamento de imagens de produtos.

1. Crie uma conta gratuita em [localstack.cloud](https://localstack.cloud/pricing).
2. Obtenha seu token pessoal no [dashboard](https://app.localstack.cloud/getting-started).
3. Configure em `backend/.env`:

```
LOCALSTACK_TOKEN=seu_token_aqui
```

---

#### E-mail (recuperação de senha)

Necessário apenas para testar o fluxo de "esqueci minha senha". Use as credenciais SMTP do Gmail em `backend/.env`:

```
MAIL_USER=seu_email@gmail.com
MAIL_PASS=sua_senha_de_app
```

Para obter a senha de app do Gmail, consulte o [tutorial da HostGator](https://www.hostgator.com.br/blog/como-usar-o-servidor-smtp-do-google/) (guia prático não oficial) ou a [documentação oficial do Google](https://knowledge.workspace.google.com/admin/gmail/advanced/route-outgoing-smtp-relay-messages-through-google?hl=pt-br) (oficial, apesar de ser voltada exclusivamente ao Google Workspace).

---

### 3. Instale e prepare o ambiente

```bash
./install.sh
```

O script irá:
1. Verificar Docker e Node.js.
2. Instalar dependências do backend, web e mobile.
3. Subir o banco de dados via Docker e executar as migrations.
4. Gerar o `JWT_SECRET` automaticamente.
5. Criar o primeiro acesso de administrador (nome, e-mail e senha).

### 4. Inicie o sistema

```bash
./up.sh
```

Acesse no navegador: **http://localhost:5173**

O QR code do Expo (mobile) aparecerá no terminal — escaneie com o app **Expo Go**.

Logs ficam em `logs/backend.log`, `logs/web.log` e `logs/mobile.log`.

---

## Primeiro Acesso

1. Acesse `http://localhost:5173/login` e autentique-se com o e-mail e senha definidos no `./install.sh`.
2. Acesse o painel **Admin** e crie ao menos 2 planos antes de continuar.
3. Realize o logout e acesse a landing page. Clique em um dos planos para iniciar o cadastro de um gerente e preencha o onboarding com dados do estabelecimento.
   > Para o onboarding, é possível usar dados gerados pelos geradores de [CNPJ](https://www.4devs.com.br/gerador_de_cnpj), [CPF](https://www.4devs.com.br/gerador_de_cpf) e [CEP](https://www.4devs.com.br/gerador_de_cep) para testes.
   
   - Para a etapa 4, de assinatura, use os [cartões de teste oficiais](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/test/cards) e faça o pagamento **com o e-mail da conta do consumidor de teste** obtida na etapa 2.1, seção do Mercado Pago, ou disponibilizada a seguir: test_user_5092580542816123576@testuser.com
      - Use os [cartões de teste oficiais](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/test/cards) e faça o pagamento com as credenciais de comprador. Sugestão:

         ``5031 4332 1540 6351``

         ``11/30 123``
         
         ``Nome: APRO``
         
         ``CPF: 123.456.789-09``
      
4. Utilize a opção **Cargos Básicos** para configurar os cargos iniciais.
5. Cadastre produtos e inicie a operação pelo **Cardápio**.

---

_Projeto desenvolvido como TCC para o curso de Análise e Desenvolvimento de Sistemas — UFPR._
