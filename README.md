# PedidoFácil 
#### **Inclusão digital para MPEs do setor alimentício.**

O **PedidoFácil** é um ecossistema integrado para gestão de restaurantes e pequenos comércios. O objetivo é oferecer uma ferramenta flexível, de baixo custo e com suporte a autoatendimento, facilitando a transição digital de microempreendedores.

Este projeto foi desenvolvido como requisito para a obtenção do título de Tecnólogo em **Análise e Desenvolvimento de Sistemas** na **Universidade Federal do Paraná (UFPR)**.

**Orientador:** Razer Anthom Nizer Rojas Montaño

**Autores:**
* Gabriela Morais Gandine
* João Pedro Abreu
* Juliano da Silva Filho
* Lara Ono Glufke Reis


---

## 🛠️ Stack


* **Frontend Web:** Vue.js 3 + TypeScript + Socket.io
* **Mobile:** React Native
* **Backend:** Node.js + Express + Zod
* **Banco de Dados:** MySQL
* **Infraestrutura:** Docker + Docker Compose + LocalStack (AWS local)
* **Integrações:** MercadoPago (Pagamentos) e

---

## ✨ Funcionalidades Principais

### 🌐 Landing Page & Onboarding
* Exploração de funcionalidades e planos.
* Fluxo de cadastro de gerente e estabelecimento com onboarding guiado.

### 💼 Gestão Administrativa (Gerente/Estabelecimento)
* **Controle de Acesso:** Gestão de cargos flexíveis e personalizáveis com permissões granulares.
* **Catálogo:** Cadastro e gestão de produtos e categorias.
* **Visual:** Personalização de dados do estabelecimento e identidade visual do cardápio.
* **Assinaturas:** Histórico de pagamentos e migração de planos via integração com **MercadoPago**.

### 🍽️ Operacional
* **Módulo Cozinha:** Visualização e controle de pedidos em tempo real.
* **Módulo Garçom:** Interface para adição de produtos e atendimento.
* **Comandas:** Gestão de comandas ativas e histórico de pagamentos.
* **Autoatendimento:** Suporte para pedidos via aplicativo móvel.

### 🧾 Fiscal e Relatórios
* **Notas Fiscais:** Emissão e gestão via API **FocusNFE**.
* **Dashboard:** Gráficos de performance e vendas.

### 🔐 Administração do Sistema (Super Admin)
* Controle de assinaturas vigentes, gestão de usuários administradores e monitoramento de gerentes.


---

## 🚀 Como Executar

### Pré-requisitos
* Docker e Docker Compose instalados.
* Node.js (versão LTS).

### Configuração Inicial
1. Clone o repositório:
   ```bash
   git clone https://github.com/laraono/pedidofacil.git

Configure o arquivo .env na raiz do projeto com as credenciais de banco de dados e chaves das APIs (JWT, MercadoPago).

# Instalação

Utilize os scripts automatizados para subir o ambiente:

## Instala as dependências e prepara o ambiente

./install

## Inicializa os containers e o sistema
./up

## 📖 Fluxo de Primeiro Acesso

* Acesse o [login](http://localhost:5173/login) do admin criado no ./install. Se tiver esquecido a senha, é possível recadastrar rodando o comando novamente. Crie ao menos 2 planos.

* Preencha o Onboarding com os dados do estabelecimento. 

* Utilize a opção de Cargos Básicos para configurar cargos iniciais.

* Cadastre seus produtos e comece a operar pelo módulo de Cardápio.


#### Obrigada! :-D

---

_Projeto desenvolvido como TCC para o curso de Análise e Desenvolvimento de Sistemas - UFPR._