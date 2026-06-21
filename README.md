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

## Sumário

- [Stack](#stack)
- [Funcionalidades](#funcionalidades)
- [Como Executar](#como-executar)
  - [Pré-requisitos](#pré-requisitos)
  - [1. Clone o repositório](#1-clone-o-repositório)
  - [2. Configure o ambiente](#2-configure-o-ambiente)
  - [3. Instale e prepare o ambiente](#3-instale-e-prepare-o-ambiente)
  - [4. Inicie o sistema](#4-inicie-o-sistema)
- [5. Primeiro Acesso](#5-primeiro-acesso)
- [6. Integrações (opcional)](#6-integrações-opcional)

---

## Stack

| Camada | Tecnologias |
|---|---|
| Frontend Web | Vue 3 (Composition API) · TypeScript · Vite · Tailwind CSS · Socket.io |
| Mobile | React Native · Expo |
| Backend | Node.js · Express · TypeORM · Zod |
| Banco de Dados | MySQL |
| Infraestrutura | Docker · Docker Compose · MinIO (armazenamento local de imagens) |
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

Copie os arquivos de configuração:

```bash
cp backend/.env.example backend/.env
cp web/.env.example web/.env
```

Devido a complexidade da configuração de ambiente, o `.env.example` já contêm credenciais de teste obrigatórias prontas para uso. Assim,**nenhum ajuste adicional é necessário para rodar localmente.**

> O `JWT_SECRET` é gerado automaticamente pelo `./install.sh` caso esteja vazio.

Para configurar suas próprias credenciais (MercadoPago, e-mail), consulte a seção 6

### 3. Instale e prepare o ambiente

```bash
./install.sh
```

O script irá:
1. Verificar Docker e Node.js.
2. Instalar dependências do backend, web e mobile.
3. Subir o banco de dados via Docker e executar as migrations.
4. Gerar o `JWT_SECRET` automaticamente (se não estiver preenchido).
5. Disponibilizar login e senha do admin master para acessá-lo

### 4. Inicie o sistema

```bash
./up.sh
```

Quando o sistema estiver no ar, o terminal exibirá a URL do site e as credenciais do painel administrativo.

O QR code do Expo (mobile) também aparecerá no terminal — escaneie com o app [**Expo Go**](https://play.google.com/store/apps/details?id=host.exp.exponent&hl=pt_BR&pli=1).

Logs ficam em `logs/backend.log`, `logs/web.log` e `logs/mobile.log`.

---

## 5. Primeiro Acesso

1. Acesse a plataforma e autentique-se com as credenciais exibidas ao final do `./up.sh` (`admin@admin.com` / `Admin@123`).
2. Acesse o painel **Admin** e crie ao menos 2 planos antes de continuar.
3. Realize o logout e acesse a landing page. Clique em um dos planos para iniciar o cadastro de um gerente e preencha o onboarding com dados do estabelecimento.
   > Para o onboarding, é possível usar dados gerados pelos geradores de [CNPJ](https://www.4devs.com.br/gerador_de_cnpj) e [CPF](https://www.4devs.com.br/gerador_de_cpf) para testes.
4. Utilize a opção **Cargos Básicos** para configurar os cargos iniciais.
5. Para a etapa de assinatura, faça o pagamento com a conta do consumidor de teste:

   **E-mail:** `test_user_5092580542816123576@testuser.com`
   
   > Este e-mail **é necessário** para a execução do processo de assinatura na sandbox. **Não utilize seu e-mail de cadastro**.

   Use os [cartões de teste oficiais](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/test/cards) ou os dados abaixo:

   | Campo | Valor |
   |---|---|
   | Número | `5031 4332 1540 6351` |
   | Validade / CVV | `11/30` / `123` |
   | Nome | `APRO` |
   | CPF | `12345678909` |


6. Cadastre produtos e inicie a operação pelo **Cardápio**.
7. Depois, mova-se para a área da **Cozinha** para preparar o pedido.
8. E logo ápos, para o **Caixa**, finalizando o processo básico de um restaurante.


### 6. Integrações (opcional)

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
ngrok http 3000 # Adicione a porta do backend
```

O ngrok gerará uma URL pública (ex: `https://xxxx.ngrok.io`). Configure-a em `backend/.env`:

```
MP_BACK_URL=https://xxxx.ngrok.io
```

Em seguida, registre essa URL nas configurações de webhook da sua integração no MercadoPago, habilitando os eventos de **pagamentos**, **planos** e **assinaturas**. O tutorial oficial está na [etapa 1.4 desta documentação](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks#configuraoviasuasintegraes).

Para simular notificações sem aguardar eventos reais, é possível usar a opção de "Simular notificação" no painel do MercadoPago, ou cancelar diretamente uma assinatura na conta do consumidor de teste - a notificação aparecerá nos logs do backend.

---

#### MinIO (upload de imagens)

O armazenamento local de imagens de produtos é feito via **MinIO**, que sobe automaticamente junto com o MySQL ao executar o `./install.sh` — nenhuma conta ou token externo é necessário.

O bucket é criado automaticamente na primeira execução. As credenciais padrão (`minioadmin` / `minioadmin`) já estão configuradas no `docker-compose.yml` e no backend.

---

#### E-mail (Formulário de Contato)

Necessário apenas para testar o fluxo de "Formulário de Contato". Use as credenciais SMTP do Gmail em `backend/.env`:

```
MAIL_USER=seu_email@gmail.com
MAIL_PASS=sua_senha_de_app
```

Para obter a senha de app do Gmail, consulte o [tutorial da HostGator](https://www.hostgator.com.br/blog/como-usar-o-servidor-smtp-do-google/) (guia prático não oficial) ou a [documentação oficial do Google](https://knowledge.workspace.google.com/admin/gmail/advanced/route-outgoing-smtp-relay-messages-through-google?hl=pt-br) (oficial, apesar de ser voltada exclusivamente ao Google Workspace).

Caso a credencial estiver vazia, o campo não estará visível.

---

_Projeto desenvolvido como TCC para o curso de Análise e Desenvolvimento de Sistemas — UFPR._
