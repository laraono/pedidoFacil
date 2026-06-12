-- =========================================================================
-- SETUP INICIAL
-- =========================================================================
CREATE SCHEMA IF NOT EXISTS foodsystem_db DEFAULT CHARACTER SET utf8mb4;
USE foodsystem_db;

-- =========================================================================
-- FASE 1: NÚCLEO (sem dependências)
-- =========================================================================

CREATE TABLE ADMIN (
  ID_Admin INT NOT NULL AUTO_INCREMENT,
  Nome     VARCHAR(100) NOT NULL,
  Email    VARCHAR(100) NOT NULL UNIQUE,
  Senha    VARCHAR(255) NOT NULL,
  PRIMARY KEY (ID_Admin)
) ENGINE = InnoDB;

CREATE TABLE METODO_PAGAMENTO (
  ID_MetodoPagamento INT NOT NULL AUTO_INCREMENT,
  Nome               VARCHAR(50) NOT NULL UNIQUE,
  PRIMARY KEY (ID_MetodoPagamento)
) ENGINE = InnoDB;

CREATE TABLE PERMISSAO (
  Nome VARCHAR(50) NOT NULL,
  PRIMARY KEY (Nome)
) ENGINE = InnoDB;

-- =========================================================================
-- FASE 2: ESTABELECIMENTO E PLANOS
-- ID_Gerente_Responsavel é adicionado como FK depois (evita loop com USUARIO)
-- =========================================================================

CREATE TABLE ESTABELECIMENTO (
  ID_Estabelecimento      INT NOT NULL AUTO_INCREMENT,
  Nome                    VARCHAR(100) NOT NULL,
  CNPJ                    VARCHAR(18) NOT NULL UNIQUE,
  Telefone                VARCHAR(20) NULL,
  Endereco                VARCHAR(255) NULL,
  Codigo_Autoatendimento  VARCHAR(10) NULL UNIQUE,
  Tem_Autoatendimento     BOOLEAN NOT NULL DEFAULT FALSE,
  Mercado_Pago_Id         VARCHAR(255) NULL,
  ID_Gerente_Responsavel  INT NULL,
  Data_Exclusao           TIMESTAMP NULL,
  PRIMARY KEY (ID_Estabelecimento)
) ENGINE = InnoDB;

CREATE TABLE PLANO (
  ID_Plano            INT NOT NULL AUTO_INCREMENT,
  Nome                VARCHAR(100) NOT NULL,
  Valor_Plano         DECIMAL(10, 2) NOT NULL,
  Frequencia          VARCHAR(20) NULL,
  Funcionalidades     TEXT NULL,
  ID_MercadoPago_Plano VARCHAR(255) NULL,
  PRIMARY KEY (ID_Plano)
) ENGINE = InnoDB;

-- =========================================================================
-- FASE 3: CONFIGURAÇÕES, MÉTODOS, CARGOS, ASSINATURAS
-- =========================================================================

CREATE TABLE CONFIGURACAO_ESTABELECIMENTO (
  ID_Estabelecimento   INT NOT NULL,
  Cor_Fundo_Geral      VARCHAR(7) NULL,
  Cor_Cards            VARCHAR(7) NULL,
  Cor_Textos           VARCHAR(7) NULL,
  Cor_Botoes           VARCHAR(7) NULL,
  Texto_Botoes         VARCHAR(7) NULL,
  Cor_Categoria_Ativa  VARCHAR(7) NULL,
  Fonte                VARCHAR(50) NULL,
  Label_Comanda        VARCHAR(30) NULL,
  Logotipo             LONGTEXT NULL,
  Permite_Observacoes  BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (ID_Estabelecimento),
  FOREIGN KEY (ID_Estabelecimento) REFERENCES ESTABELECIMENTO (ID_Estabelecimento)
) ENGINE = InnoDB;

CREATE TABLE ESTABELECIMENTO_METODO_PAGAMENTO (
  ID_Estabelecimento INT NOT NULL,
  ID_MetodoPagamento INT NOT NULL,
  PRIMARY KEY (ID_Estabelecimento, ID_MetodoPagamento),
  FOREIGN KEY (ID_Estabelecimento) REFERENCES ESTABELECIMENTO (ID_Estabelecimento),
  FOREIGN KEY (ID_MetodoPagamento) REFERENCES METODO_PAGAMENTO (ID_MetodoPagamento)
) ENGINE = InnoDB;

CREATE TABLE CARGO (
  ID_Cargo           INT NOT NULL AUTO_INCREMENT,
  ID_Estabelecimento INT NOT NULL,
  Nome               VARCHAR(50) NOT NULL,
  Data_Exclusao      TIMESTAMP NULL,
  PRIMARY KEY (ID_Cargo),
  FOREIGN KEY (ID_Estabelecimento) REFERENCES ESTABELECIMENTO (ID_Estabelecimento)
) ENGINE = InnoDB;

CREATE TABLE ASSINATURA (
  ID_Assinatura        INT NOT NULL AUTO_INCREMENT,
  ID_Estabelecimento   INT NOT NULL UNIQUE,
  ID_Plano             INT NOT NULL,
  Data_Inicio          DATE NOT NULL,
  Data_Vencimento_Prox DATE NOT NULL,
  Status               VARCHAR(20) NOT NULL CHECK (Status IN ('Pendente', 'Paga', 'Expirada', 'Cancelada')),
  ID_MercadoPago       VARCHAR(255) NULL,
  Valor                DECIMAL(10, 2) NULL,
  PRIMARY KEY (ID_Assinatura),
  FOREIGN KEY (ID_Estabelecimento) REFERENCES ESTABELECIMENTO (ID_Estabelecimento),
  FOREIGN KEY (ID_Plano) REFERENCES PLANO (ID_Plano)
) ENGINE = InnoDB;

CREATE TABLE REFRESH_TOKEN_ADMIN (
  ID_Token   INT NOT NULL AUTO_INCREMENT,
  Token_Hash VARCHAR(255) NOT NULL UNIQUE,
  Revogado   BOOLEAN NOT NULL DEFAULT FALSE,
  Expires_At TIMESTAMP NOT NULL,
  ID_Admin   INT NOT NULL,
  PRIMARY KEY (ID_Token),
  FOREIGN KEY (ID_Admin) REFERENCES ADMIN (ID_Admin) ON DELETE CASCADE
) ENGINE = InnoDB;

-- =========================================================================
-- FASE 4: PERMISSÕES DE CARGO E USUÁRIOS
-- =========================================================================

CREATE TABLE CARGO_PERMISSAO (
  ID_Cargo       INT NOT NULL,
  Nome_Permissao VARCHAR(50) NOT NULL,
  PRIMARY KEY (ID_Cargo, Nome_Permissao),
  FOREIGN KEY (ID_Cargo) REFERENCES CARGO (ID_Cargo) ON DELETE CASCADE,
  FOREIGN KEY (Nome_Permissao) REFERENCES PERMISSAO (Nome)
) ENGINE = InnoDB;

CREATE TABLE USUARIO (
  ID_Usuario             INT NOT NULL AUTO_INCREMENT,
  ID_Cargo               INT NULL,
  Nome                   VARCHAR(100) NOT NULL,
  Email                  VARCHAR(100) NOT NULL UNIQUE,
  Senha                  VARCHAR(255) NOT NULL,
  Status                 VARCHAR(10) NOT NULL DEFAULT 'Inativo' CHECK (Status IN ('Ativo', 'Inativo')),
  Password_Reset_Token   VARCHAR(255) NULL,
  Password_Reset_Expires TIMESTAMP NULL,
  Telefone               VARCHAR(20) NULL,
  Data_Criacao           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Data_Exclusao          TIMESTAMP NULL,
  PRIMARY KEY (ID_Usuario),
  FOREIGN KEY (ID_Cargo) REFERENCES CARGO (ID_Cargo)
) ENGINE = InnoDB;

CREATE TABLE HISTORICO_PAGAMENTO_ASSINATURA (
  ID_Historico      INT NOT NULL AUTO_INCREMENT,
  ID_Assinatura     INT NOT NULL,
  ID_MP_Pagamento   VARCHAR(255) NOT NULL UNIQUE,
  Valor             DECIMAL(10, 2) NOT NULL,
  Status            VARCHAR(10) NOT NULL CHECK (Status IN ('Aprovado', 'Rejeitado')),
  Tipo_Pagamento    VARCHAR(50) NULL,
  Nome_Plano        VARCHAR(255) NOT NULL,
  Data_Pagamento    DATETIME NULL,
  Data_Criacao      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (ID_Historico),
  FOREIGN KEY (ID_Assinatura) REFERENCES ASSINATURA (ID_Assinatura)
) ENGINE = InnoDB;

-- =========================================================================
-- FASE 5: RESOLUÇÃO DO LOOP + PERFIS E TOKENS DE USUÁRIO
-- =========================================================================

ALTER TABLE ESTABELECIMENTO
  ADD CONSTRAINT fk_est_gerente
  FOREIGN KEY (ID_Gerente_Responsavel) REFERENCES USUARIO (ID_Usuario);

CREATE TABLE PERFIL_GERENTE (
  ID_Usuario INT NOT NULL,
  CPF        VARCHAR(14) NULL UNIQUE,
  Endereco   VARCHAR(255) NULL,
  Cidade     VARCHAR(100) NULL,
  Estado     VARCHAR(2) NULL,
  CEP        VARCHAR(10) NULL,
  PRIMARY KEY (ID_Usuario),
  FOREIGN KEY (ID_Usuario) REFERENCES USUARIO (ID_Usuario)
) ENGINE = InnoDB;

CREATE TABLE REFRESH_TOKEN_USUARIO (
  ID_Token   INT NOT NULL AUTO_INCREMENT,
  Token_Hash VARCHAR(255) NOT NULL UNIQUE,
  Revogado   BOOLEAN NOT NULL DEFAULT FALSE,
  Expires_At TIMESTAMP NOT NULL,
  ID_Usuario INT NOT NULL,
  PRIMARY KEY (ID_Token),
  FOREIGN KEY (ID_Usuario) REFERENCES USUARIO (ID_Usuario) ON DELETE CASCADE
) ENGINE = InnoDB;

-- =========================================================================
-- FASE 6: CARDÁPIO, CAIXA E ESTOQUE
-- =========================================================================

CREATE TABLE CATEGORIA (
  ID_Categoria       INT NOT NULL AUTO_INCREMENT,
  ID_Estabelecimento INT NOT NULL,
  Nome               VARCHAR(50) NOT NULL,
  Imagem             VARCHAR(255) NULL,
  Status             VARCHAR(10) NOT NULL DEFAULT 'Ativa' CHECK (Status IN ('Ativa', 'Inativa')),
  Data_Exclusao      TIMESTAMP NULL,
  PRIMARY KEY (ID_Categoria),
  FOREIGN KEY (ID_Estabelecimento) REFERENCES ESTABELECIMENTO (ID_Estabelecimento)
) ENGINE = InnoDB;

CREATE TABLE CAIXA (
  ID_Caixa           INT NOT NULL AUTO_INCREMENT,
  ID_Estabelecimento INT NOT NULL,
  Nome               VARCHAR(255) NOT NULL,
  Mercado_Pago_Id    VARCHAR(255) NOT NULL,
  ID_Terminal        VARCHAR(255) NULL,
  Data_Criacao       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Data_Exclusao      TIMESTAMP NULL,
  PRIMARY KEY (ID_Caixa),
  FOREIGN KEY (ID_Estabelecimento) REFERENCES ESTABELECIMENTO (ID_Estabelecimento)
) ENGINE = InnoDB;

CREATE TABLE PRODUTO (
  ID_Produto    INT NOT NULL AUTO_INCREMENT,
  ID_Categoria  INT NOT NULL,
  Nome          VARCHAR(50) NOT NULL,
  Descricao     VARCHAR(255) NULL,
  Imagem        LONGTEXT NULL,
  Estocavel     BOOLEAN NOT NULL,
  Status        VARCHAR(10) NOT NULL DEFAULT 'Ativo' CHECK (Status IN ('Ativo', 'Inativo')),
  Preco_Base    DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  Data_Exclusao TIMESTAMP NULL,
  PRIMARY KEY (ID_Produto),
  FOREIGN KEY (ID_Categoria) REFERENCES CATEGORIA (ID_Categoria)
) ENGINE = InnoDB;

CREATE TABLE PRODUTO_VARIACAO (
  ID_Variacao    INT NOT NULL AUTO_INCREMENT,
  ID_Produto     INT NOT NULL,
  Nome           VARCHAR(50) NOT NULL,
  Preco_Adicional DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  Status         VARCHAR(10) NOT NULL DEFAULT 'Ativo' CHECK (Status IN ('Ativo', 'Inativo')),
  Data_Exclusao  TIMESTAMP NULL,
  PRIMARY KEY (ID_Variacao),
  FOREIGN KEY (ID_Produto) REFERENCES PRODUTO (ID_Produto)
) ENGINE = InnoDB;

CREATE TABLE ESTOQUE_ITEM (
  ID_Estoque_Item  INT NOT NULL AUTO_INCREMENT,
  ID_Produto       INT NOT NULL UNIQUE,
  Nome             VARCHAR(50) NOT NULL,
  Unidade_Medida   VARCHAR(20) NOT NULL,
  Quantidade_Atual INT NOT NULL DEFAULT 0,
  Data_Exclusao    TIMESTAMP NULL,
  PRIMARY KEY (ID_Estoque_Item),
  FOREIGN KEY (ID_Produto) REFERENCES PRODUTO (ID_Produto)
) ENGINE = InnoDB;

CREATE TABLE MOVIMENTACAO_ESTOQUE (
  ID_Movimentacao        INT NOT NULL AUTO_INCREMENT,
  ID_Estoque_Item        INT NOT NULL,
  ID_Usuario_Responsavel INT NOT NULL,
  Quantidade             INT NOT NULL,
  Tipo_Movimentacao      VARCHAR(10) NOT NULL CHECK (Tipo_Movimentacao IN ('Entrada', 'Saida', 'Ajuste')),
  Justificativa          VARCHAR(255) NULL,
  PRIMARY KEY (ID_Movimentacao),
  FOREIGN KEY (ID_Estoque_Item) REFERENCES ESTOQUE_ITEM (ID_Estoque_Item),
  FOREIGN KEY (ID_Usuario_Responsavel) REFERENCES USUARIO (ID_Usuario)
) ENGINE = InnoDB;

-- =========================================================================
-- FASE 7: CUPONS E COMANDAS
-- =========================================================================

CREATE TABLE CUPOM_DESCONTO (
  ID_Cupom           INT NOT NULL AUTO_INCREMENT,
  ID_Estabelecimento INT NOT NULL,
  Codigo             VARCHAR(50) NOT NULL,
  Tipo_Desconto      VARCHAR(10) NOT NULL CHECK (Tipo_Desconto IN ('Valor', 'Percentual')),
  Valor_Desconto     DECIMAL(10, 2) NOT NULL,
  Data_Validade      DATE NULL,
  Data_Exclusao      TIMESTAMP NULL,
  PRIMARY KEY (ID_Cupom),
  UNIQUE KEY UK_Estabelecimento_Codigo (ID_Estabelecimento, Codigo),
  FOREIGN KEY (ID_Estabelecimento) REFERENCES ESTABELECIMENTO (ID_Estabelecimento)
) ENGINE = InnoDB;

CREATE TABLE COMANDA (
  ID_Comanda              INT NOT NULL AUTO_INCREMENT,
  ID_Estabelecimento      INT NOT NULL,
  ID_Cupom_Aplicado       INT NULL,
  Descricao               VARCHAR(100) NOT NULL,
  Status                  VARCHAR(15) NOT NULL DEFAULT 'Aberta' CHECK (Status IN ('Aberta', 'Fechada', 'Cancelada')),
  Total                   DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  Valor_Desconto_Aplicado DECIMAL(10, 2) NULL,
  Tipo_Desconto_Aplicado  VARCHAR(15) NULL CHECK (Tipo_Desconto_Aplicado IN ('Valor', 'Percentual')),
  Data_Abertura           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT CHK_Desconto CHECK (
    (Valor_Desconto_Aplicado IS NULL AND Tipo_Desconto_Aplicado IS NULL) OR
    (Valor_Desconto_Aplicado IS NOT NULL AND Tipo_Desconto_Aplicado IS NOT NULL)
  ),
  PRIMARY KEY (ID_Comanda),
  FOREIGN KEY (ID_Estabelecimento) REFERENCES ESTABELECIMENTO (ID_Estabelecimento),
  FOREIGN KEY (ID_Cupom_Aplicado) REFERENCES CUPOM_DESCONTO (ID_Cupom)
) ENGINE = InnoDB;

CREATE INDEX idx_comanda_est_status_data ON COMANDA (ID_Estabelecimento, Status, Data_Abertura);

-- =========================================================================
-- FASE 8: PEDIDOS E ITENS
-- =========================================================================

CREATE TABLE PEDIDO (
  ID_Pedido               INT NOT NULL AUTO_INCREMENT,
  ID_Comanda              INT NOT NULL,
  ID_Usuario_Cancelador   INT NULL,
  ID_Usuario_Criador      INT NULL,
  Status                  VARCHAR(20) NOT NULL CHECK (Status IN ('Aguardando_Preparo', 'Em_Preparo', 'Pronto', 'Finalizado', 'Cancelado')),
  Observacao              VARCHAR(255) NULL,
  Cancelamento_Descricao  VARCHAR(255) NULL,
  Tipo_Atendimento        VARCHAR(20) NOT NULL CHECK (Tipo_Atendimento IN ('Garcom', 'Caixa', 'Autoatendimento')),
  Data_Hora_Chegada       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (ID_Pedido),
  FOREIGN KEY (ID_Comanda) REFERENCES COMANDA (ID_Comanda),
  FOREIGN KEY (ID_Usuario_Cancelador) REFERENCES USUARIO (ID_Usuario),
  FOREIGN KEY (ID_Usuario_Criador) REFERENCES USUARIO (ID_Usuario)
) ENGINE = InnoDB;

CREATE INDEX idx_pedido_comanda_status_data ON PEDIDO (ID_Comanda, Status, Data_Hora_Chegada);

CREATE TABLE ITEM_PEDIDO (
  ID_Item                  INT NOT NULL AUTO_INCREMENT,
  ID_Pedido                INT NOT NULL,
  ID_Produto               INT NOT NULL,
  ID_Variacao              INT NULL,
  Quantidade               INT NOT NULL,
  Preco_Unitario_Momento   DECIMAL(10, 2) NOT NULL,
  Observacoes_Cliente      VARCHAR(255) NULL,
  Data_Criacao             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (ID_Item),
  FOREIGN KEY (ID_Pedido) REFERENCES PEDIDO (ID_Pedido),
  FOREIGN KEY (ID_Produto) REFERENCES PRODUTO (ID_Produto),
  FOREIGN KEY (ID_Variacao) REFERENCES PRODUTO_VARIACAO (ID_Variacao)
) ENGINE = InnoDB;

-- =========================================================================
-- FASE 9: PAGAMENTOS E FISCAL
-- =========================================================================

CREATE TABLE PAGAMENTO (
  ID_Pagamento             INT NOT NULL AUTO_INCREMENT,
  ID_Estabelecimento       INT NOT NULL,
  ID_Usuario_Caixa         INT NULL,
  ID_MetodoPagamento       INT NOT NULL,
  Valor_Total              DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  Troco                    DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  Status                   VARCHAR(10) NOT NULL DEFAULT 'Pendente' CHECK (Status IN ('Pendente', 'Aprovado', 'Cancelado', 'Estornado')),
  ID_Pedido_MercadoPago    VARCHAR(255) NULL,
  ID_Pagamento_MercadoPago VARCHAR(255) NULL,
  Data_Hora_Pagamento      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Data_Exclusao            TIMESTAMP NULL,
  PRIMARY KEY (ID_Pagamento),
  FOREIGN KEY (ID_Estabelecimento) REFERENCES ESTABELECIMENTO (ID_Estabelecimento),
  FOREIGN KEY (ID_Usuario_Caixa) REFERENCES USUARIO (ID_Usuario),
  FOREIGN KEY (ID_MetodoPagamento) REFERENCES METODO_PAGAMENTO (ID_MetodoPagamento)
) ENGINE = InnoDB;

CREATE INDEX idx_pagamento_est_status_data ON PAGAMENTO (ID_Estabelecimento, Status, Data_Hora_Pagamento);

CREATE TABLE PAGAMENTO_PEDIDO (
  ID_Pedido               INT NOT NULL,
  ID_Pagamento            INT NOT NULL,
  Valor_Pago_Deste_Pedido DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (ID_Pedido, ID_Pagamento),
  FOREIGN KEY (ID_Pagamento) REFERENCES PAGAMENTO (ID_Pagamento),
  FOREIGN KEY (ID_Pedido) REFERENCES PEDIDO (ID_Pedido)
) ENGINE = InnoDB;

CREATE TABLE NOTA_FISCAL (
  ID_Nota           INT NOT NULL AUTO_INCREMENT,
  ID_Pagamento      INT NOT NULL UNIQUE,
  ID_Estabelecimento INT NOT NULL,
  Numero_Nota       VARCHAR(50) NOT NULL,
  CPF_CNPJ_Cliente  VARCHAR(18) NULL,
  Status            VARCHAR(15) NOT NULL DEFAULT 'Autorizada' CHECK (Status IN ('Autorizada', 'Cancelada', 'Erro')),
  Valor_Total       DECIMAL(10, 2) NOT NULL,
  Data_Emissao      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Data_Exclusao     TIMESTAMP NULL,
  PRIMARY KEY (ID_Nota),
  FOREIGN KEY (ID_Pagamento) REFERENCES PAGAMENTO (ID_Pagamento),
  FOREIGN KEY (ID_Estabelecimento) REFERENCES ESTABELECIMENTO (ID_Estabelecimento)
) ENGINE = InnoDB;

-- =========================================================================
-- SEEDS
-- =========================================================================

INSERT INTO PERMISSAO (Nome) VALUES
  ('RELATORIOS'),
  ('COZINHA'),
  ('CARDAPIO'),
  ('FUNCIONARIOS'),
  ('CONFIGURACAO'),
  ('ASSINATURA'),
  ('CRIAR_PEDIDO'),
  ('CAIXA'),
  ('COMANDAS_FINALIZADAS'),
  ('CUPONS'),
  ('NOTA_FISCAL');

INSERT INTO METODO_PAGAMENTO (Nome) VALUES
  ('Dinheiro'),
  ('Débito'),
  ('Crédito'),
  ('Pix'),
  ('Vale Refeição'),
  ('Vale Alimentação');
