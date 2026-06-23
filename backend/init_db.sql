SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE SCHEMA IF NOT EXISTS foodsystem_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE foodsystem_db;

CREATE TABLE IF NOT EXISTS ADMIN (
  ID_Admin INT NOT NULL AUTO_INCREMENT,
  Nome     VARCHAR(100) NOT NULL,
  Email    VARCHAR(100) NOT NULL,
  Senha    VARCHAR(255) NOT NULL,
  PRIMARY KEY (ID_Admin),
  UNIQUE KEY IDX_c4da08b5c493a1e6b98e881ea8 (Email)
) ENGINE = InnoDB;

INSERT IGNORE INTO ADMIN (Nome, Email, Senha) VALUES (
  'Dono da Plataforma',
  'dono_master@admin.com',
  '$2b$12$ir18RboiRLVp8dWwlkicw.KnCEnuJwOlDTw85rwu9KEuTvUa1OjF2'
);

CREATE TABLE IF NOT EXISTS METODO_PAGAMENTO (
  ID_MetodoPagamento INT NOT NULL AUTO_INCREMENT,
  Nome               VARCHAR(50) NOT NULL,
  PRIMARY KEY (ID_MetodoPagamento),
  UNIQUE KEY IDX_58f21eb039d1bcfa59d4be7a0f (Nome)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS PERMISSAO (
  Nome VARCHAR(50) NOT NULL,
  PRIMARY KEY (Nome)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS STATUS_ASSINATURA (
  ID_Status INT NOT NULL AUTO_INCREMENT,
  Nome      VARCHAR(30) NOT NULL,
  PRIMARY KEY (ID_Status),
  UNIQUE KEY UK_StatusAssinatura_Nome (Nome)
) ENGINE = InnoDB;

INSERT IGNORE INTO STATUS_ASSINATURA (Nome) VALUES ('Pendente'), ('Paga'), ('Expirada'), ('Cancelada');

CREATE TABLE IF NOT EXISTS STATUS_HISTORICO_ASSINATURA (
  ID_Status INT NOT NULL AUTO_INCREMENT,
  Nome      VARCHAR(30) NOT NULL,
  PRIMARY KEY (ID_Status),
  UNIQUE KEY UK_StatusHistorico_Nome (Nome)
) ENGINE = InnoDB;

INSERT IGNORE INTO STATUS_HISTORICO_ASSINATURA (Nome) VALUES ('Aprovado'), ('Rejeitado');

CREATE TABLE IF NOT EXISTS STATUS_COMANDA (
  ID_Status INT NOT NULL AUTO_INCREMENT,
  Nome      VARCHAR(30) NOT NULL,
  PRIMARY KEY (ID_Status),
  UNIQUE KEY UK_StatusComanda_Nome (Nome)
) ENGINE = InnoDB;

INSERT IGNORE INTO STATUS_COMANDA (Nome) VALUES ('Aberta'), ('Fechada'), ('Cancelada');

CREATE TABLE IF NOT EXISTS STATUS_PEDIDO (
  ID_Status INT NOT NULL AUTO_INCREMENT,
  Nome      VARCHAR(30) NOT NULL,
  PRIMARY KEY (ID_Status),
  UNIQUE KEY UK_StatusPedido_Nome (Nome)
) ENGINE = InnoDB;

INSERT IGNORE INTO STATUS_PEDIDO (Nome) VALUES ('Aguardando_Preparo'), ('Em_Preparo'), ('Pronto'), ('Finalizado'), ('Cancelado');

CREATE TABLE IF NOT EXISTS STATUS_PAGAMENTO (
  ID_Status INT NOT NULL AUTO_INCREMENT,
  Nome      VARCHAR(30) NOT NULL,
  PRIMARY KEY (ID_Status),
  UNIQUE KEY UK_StatusPagamento_Nome (Nome)
) ENGINE = InnoDB;

INSERT IGNORE INTO STATUS_PAGAMENTO (Nome) VALUES ('Pendente'), ('Aprovado'), ('Cancelado'), ('Estornado');

CREATE TABLE IF NOT EXISTS STATUS_NOTA_FISCAL (
  ID_Status INT NOT NULL AUTO_INCREMENT,
  Nome      VARCHAR(30) NOT NULL,
  PRIMARY KEY (ID_Status),
  UNIQUE KEY UK_StatusNotaFiscal_Nome (Nome)
) ENGINE = InnoDB;

INSERT IGNORE INTO STATUS_NOTA_FISCAL (Nome) VALUES ('Autorizada'), ('Cancelada'), ('Erro');

CREATE TABLE IF NOT EXISTS TIPO_MOVIMENTACAO (
  ID_TipoMovimentacao INT NOT NULL AUTO_INCREMENT,
  Nome                VARCHAR(30) NOT NULL,
  PRIMARY KEY (ID_TipoMovimentacao),
  UNIQUE KEY UK_TipoMovimentacao_Nome (Nome)
) ENGINE = InnoDB;

INSERT IGNORE INTO TIPO_MOVIMENTACAO (Nome) VALUES ('Entrada'), ('Saida'), ('Ajuste');

CREATE TABLE IF NOT EXISTS TIPO_DESCONTO (
  ID_TipoDesconto INT NOT NULL AUTO_INCREMENT,
  Nome            VARCHAR(30) NOT NULL,
  PRIMARY KEY (ID_TipoDesconto),
  UNIQUE KEY UK_TipoDesconto_Nome (Nome)
) ENGINE = InnoDB;

INSERT IGNORE INTO TIPO_DESCONTO (Nome) VALUES ('Valor'), ('Percentual');

CREATE TABLE IF NOT EXISTS ENDERECO (
  ID_Endereco INT NOT NULL AUTO_INCREMENT,
  Logradouro  VARCHAR(255) NULL,
  Cidade      VARCHAR(100) NULL,
  Estado      CHAR(2) NULL,
  CEP         VARCHAR(10) NULL,
  PRIMARY KEY (ID_Endereco)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS ESTABELECIMENTO (
  ID_Estabelecimento     INT NOT NULL AUTO_INCREMENT,
  Nome                   VARCHAR(100) NOT NULL,
  CNPJ                   VARCHAR(18) NOT NULL,
  Telefone               VARCHAR(20) NULL,
  ID_Endereco            INT NULL,
  Codigo_Autoatendimento VARCHAR(10) NULL,
  Tem_Autoatendimento    BOOLEAN NOT NULL DEFAULT FALSE,
  Mercado_Pago_Id        VARCHAR(255) NULL,
  ID_Gerente_Responsavel INT NULL,
  Data_Exclusao          TIMESTAMP NULL,
  PRIMARY KEY (ID_Estabelecimento),
  UNIQUE KEY IDX_a15e54fa574124dbc4abd9650c (CNPJ),
  UNIQUE KEY IDX_79dce4cf49163d518e9457f6b3 (Codigo_Autoatendimento),
  FOREIGN KEY (ID_Endereco) REFERENCES ENDERECO (ID_Endereco)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS PLANO (
  ID_Plano             INT NOT NULL AUTO_INCREMENT,
  Nome                 VARCHAR(100) NOT NULL,
  Valor_Plano          DECIMAL(10, 2) NOT NULL,
  Frequencia           VARCHAR(20) NULL,
  ID_MercadoPago_Plano VARCHAR(255) NULL,
  PRIMARY KEY (ID_Plano)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS FUNCIONALIDADE_PLANO (
  ID_Funcionalidade INT NOT NULL AUTO_INCREMENT,
  Descricao         VARCHAR(255) NOT NULL,
  ID_Plano          INT NULL,
  PRIMARY KEY (ID_Funcionalidade),
  FOREIGN KEY (ID_Plano) REFERENCES PLANO (ID_Plano) ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS CONFIGURACAO_ESTABELECIMENTO (
  ID_Estabelecimento  INT NOT NULL,
  Cor_Fundo_Geral     VARCHAR(7) NULL,
  Cor_Cards           VARCHAR(7) NULL,
  Cor_Textos          VARCHAR(7) NULL,
  Cor_Botoes          VARCHAR(7) NULL,
  Texto_Botoes        VARCHAR(7) NULL,
  Cor_Categoria_Ativa VARCHAR(7) NULL,
  Fonte               VARCHAR(50) NULL,
  Label_Comanda       VARCHAR(30) NULL,
  Logotipo            VARCHAR(500) NULL,
  Permite_Observacoes BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (ID_Estabelecimento),
  FOREIGN KEY (ID_Estabelecimento) REFERENCES ESTABELECIMENTO (ID_Estabelecimento)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS ESTABELECIMENTO_METODO_PAGAMENTO (
  ID_Estabelecimento INT NOT NULL,
  ID_MetodoPagamento INT NOT NULL,
  PRIMARY KEY (ID_Estabelecimento, ID_MetodoPagamento),
  FOREIGN KEY (ID_Estabelecimento) REFERENCES ESTABELECIMENTO (ID_Estabelecimento) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (ID_MetodoPagamento) REFERENCES METODO_PAGAMENTO (ID_MetodoPagamento) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS CARGO (
  ID_Cargo           INT NOT NULL AUTO_INCREMENT,
  ID_Estabelecimento INT NOT NULL,
  Nome               VARCHAR(50) NOT NULL,
  Data_Exclusao      TIMESTAMP NULL,
  PRIMARY KEY (ID_Cargo),
  FOREIGN KEY (ID_Estabelecimento) REFERENCES ESTABELECIMENTO (ID_Estabelecimento)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS ASSINATURA (
  ID_Assinatura        INT NOT NULL AUTO_INCREMENT,
  ID_Estabelecimento   INT NOT NULL,
  ID_Plano             INT NULL,
  Data_Inicio          DATE NOT NULL,
  Data_Vencimento_Prox DATE NOT NULL,
  ID_Status            INT NOT NULL,
  ID_MercadoPago       VARCHAR(255) NULL,
  Valor                DECIMAL(10, 2) NULL,
  PRIMARY KEY (ID_Assinatura),
  UNIQUE KEY IDX_49ffbd5130542196a401fb2738 (ID_Estabelecimento),
  FOREIGN KEY (ID_Estabelecimento) REFERENCES ESTABELECIMENTO (ID_Estabelecimento),
  FOREIGN KEY (ID_Plano) REFERENCES PLANO (ID_Plano),
  FOREIGN KEY (ID_Status) REFERENCES STATUS_ASSINATURA (ID_Status)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS REFRESH_TOKEN_ADMIN (
  ID_Token   INT NOT NULL AUTO_INCREMENT,
  Token_Hash VARCHAR(255) NOT NULL,
  Revogado   BOOLEAN NOT NULL DEFAULT FALSE,
  Expires_At TIMESTAMP NOT NULL,
  ID_Admin   INT NULL,
  PRIMARY KEY (ID_Token),
  UNIQUE KEY IDX_1bbcfdd46195c3d8f5b6c18013 (Token_Hash),
  FOREIGN KEY (ID_Admin) REFERENCES ADMIN (ID_Admin) ON DELETE CASCADE
) ENGINE = InnoDB;

-- =========================================================================
-- FASE 6: PERMISSÕES DE CARGO E USUÁRIOS
-- =========================================================================

CREATE TABLE IF NOT EXISTS CARGO_PERMISSAO (
  ID_Cargo       INT NOT NULL,
  Nome_Permissao VARCHAR(50) NOT NULL,
  PRIMARY KEY (ID_Cargo, Nome_Permissao),
  FOREIGN KEY (ID_Cargo) REFERENCES CARGO (ID_Cargo) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (Nome_Permissao) REFERENCES PERMISSAO (Nome) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS USUARIO (
  ID_Usuario             INT NOT NULL AUTO_INCREMENT,
  ID_Cargo               INT NULL,
  Nome                   VARCHAR(100) NOT NULL,
  Email                  VARCHAR(100) NOT NULL,
  Senha                  VARCHAR(255) NOT NULL,
  Ativo                  TINYINT NOT NULL DEFAULT 0,
  Password_Reset_Token   VARCHAR(255) NULL,
  Password_Reset_Expires TIMESTAMP NULL,
  Telefone               VARCHAR(20) NULL,
  Data_Criacao           TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  Data_Exclusao          TIMESTAMP(6) NULL,
  PRIMARY KEY (ID_Usuario),
  UNIQUE KEY IDX_b588f17ba2b208199bbaae42ae (Email),
  FOREIGN KEY (ID_Cargo) REFERENCES CARGO (ID_Cargo)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS HISTORICO_PAGAMENTO_ASSINATURA (
  ID_Historico    INT NOT NULL AUTO_INCREMENT,
  ID_Assinatura   INT NULL,
  ID_MP_Pagamento VARCHAR(255) NOT NULL,
  Valor           DECIMAL(10, 2) NOT NULL,
  ID_Status       INT NOT NULL,
  Tipo_Pagamento  VARCHAR(50) NULL,
  Nome_Plano      VARCHAR(255) NOT NULL,
  Data_Pagamento  DATETIME NULL,
  Data_Criacao    TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (ID_Historico),
  UNIQUE KEY IDX_4dbbb5ab8056e7f1108e5c0270 (ID_MP_Pagamento),
  FOREIGN KEY (ID_Assinatura) REFERENCES ASSINATURA (ID_Assinatura),
  FOREIGN KEY (ID_Status) REFERENCES STATUS_HISTORICO_ASSINATURA (ID_Status)
) ENGINE = InnoDB;

DROP PROCEDURE IF EXISTS _add_fk_est_gerente;
DELIMITER //
CREATE PROCEDURE _add_fk_est_gerente()
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME        = 'ESTABELECIMENTO'
      AND CONSTRAINT_NAME   = 'FK_28e1d2575f8a94cc6b4264c57b1'
      AND CONSTRAINT_TYPE   = 'FOREIGN KEY'
  ) THEN
    ALTER TABLE ESTABELECIMENTO
      ADD CONSTRAINT FK_28e1d2575f8a94cc6b4264c57b1
      FOREIGN KEY (ID_Gerente_Responsavel) REFERENCES USUARIO (ID_Usuario);
  END IF;
END //
DELIMITER ;
CALL _add_fk_est_gerente();
DROP PROCEDURE IF EXISTS _add_fk_est_gerente;

CREATE TABLE IF NOT EXISTS PERFIL_GERENTE (
  ID_Usuario  INT NOT NULL,
  CPF         VARCHAR(14) NULL,
  ID_Endereco INT NULL,
  PRIMARY KEY (ID_Usuario),
  UNIQUE KEY UQ_PerfilGerente_CPF (CPF),
  FOREIGN KEY (ID_Usuario) REFERENCES USUARIO (ID_Usuario),
  FOREIGN KEY (ID_Endereco) REFERENCES ENDERECO (ID_Endereco)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS REFRESH_TOKEN_USUARIO (
  ID_Token   INT NOT NULL AUTO_INCREMENT,
  Token_Hash VARCHAR(255) NOT NULL,
  Revogado   BOOLEAN NOT NULL DEFAULT FALSE,
  Expires_At TIMESTAMP NOT NULL,
  ID_Usuario INT NULL,
  PRIMARY KEY (ID_Token),
  UNIQUE KEY IDX_d6dda53827096a07aad62101cc (Token_Hash),
  FOREIGN KEY (ID_Usuario) REFERENCES USUARIO (ID_Usuario)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS CATEGORIA (
  ID_Categoria       INT NOT NULL AUTO_INCREMENT,
  ID_Estabelecimento INT NOT NULL,
  Nome               VARCHAR(50) NOT NULL,
  Imagem             VARCHAR(255) NULL,
  Ativo              TINYINT NOT NULL DEFAULT 1,
  Data_Exclusao      TIMESTAMP(6) NULL,
  PRIMARY KEY (ID_Categoria),
  FOREIGN KEY (ID_Estabelecimento) REFERENCES ESTABELECIMENTO (ID_Estabelecimento)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS CAIXA (
  ID_Caixa           INT NOT NULL AUTO_INCREMENT,
  ID_Estabelecimento INT NOT NULL,
  Nome               VARCHAR(255) NOT NULL,
  Mercado_Pago_Id    VARCHAR(255) NOT NULL,
  ID_Terminal        VARCHAR(255) NULL,
  Data_Criacao       TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  Data_Exclusao      TIMESTAMP(6) NULL,
  PRIMARY KEY (ID_Caixa),
  FOREIGN KEY (ID_Estabelecimento) REFERENCES ESTABELECIMENTO (ID_Estabelecimento)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS PRODUTO (
  ID_Produto    INT NOT NULL AUTO_INCREMENT,
  ID_Categoria  INT NOT NULL,
  Nome          VARCHAR(50) NOT NULL,
  Descricao     VARCHAR(255) NULL,
  Imagem        VARCHAR(500) NULL,
  Estocavel     BOOLEAN NOT NULL,
  Ativo         TINYINT NOT NULL DEFAULT 1,
  Preco_Base    DECIMAL(10, 2) NOT NULL,
  Data_Exclusao TIMESTAMP(6) NULL,
  PRIMARY KEY (ID_Produto),
  FOREIGN KEY (ID_Categoria) REFERENCES CATEGORIA (ID_Categoria)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS PRODUTO_VARIACAO (
  ID_Variacao     INT NOT NULL AUTO_INCREMENT,
  ID_Produto      INT NOT NULL,
  Nome            VARCHAR(50) NOT NULL,
  Preco_Adicional DECIMAL(10, 2) NOT NULL,
  Ativo           TINYINT NOT NULL DEFAULT 1,
  Data_Exclusao   TIMESTAMP(6) NULL,
  PRIMARY KEY (ID_Variacao),
  FOREIGN KEY (ID_Produto) REFERENCES PRODUTO (ID_Produto)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS ESTOQUE_ITEM (
  ID_Estoque_Item  INT NOT NULL AUTO_INCREMENT,
  ID_Produto       INT NOT NULL,
  Nome             VARCHAR(50) NOT NULL,
  Unidade_Medida   VARCHAR(255) NOT NULL,
  Quantidade_Atual INT NOT NULL,
  Data_Exclusao    TIMESTAMP(6) NULL,
  PRIMARY KEY (ID_Estoque_Item),
  UNIQUE KEY IDX_8c186d01380c5905737f56e848 (ID_Produto),
  FOREIGN KEY (ID_Produto) REFERENCES PRODUTO (ID_Produto)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS MOVIMENTACAO_ESTOQUE (
  ID_Movimentacao        INT NOT NULL AUTO_INCREMENT,
  ID_Estoque_Item        INT NULL,
  ID_Usuario_Responsavel INT NULL,
  ID_TipoMovimentacao    INT NULL,
  Quantidade             INT NOT NULL,
  Justificativa          VARCHAR(255) NULL,
  Data_Criacao           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (ID_Movimentacao),
  FOREIGN KEY (ID_Estoque_Item) REFERENCES ESTOQUE_ITEM (ID_Estoque_Item),
  FOREIGN KEY (ID_Usuario_Responsavel) REFERENCES USUARIO (ID_Usuario),
  FOREIGN KEY (ID_TipoMovimentacao) REFERENCES TIPO_MOVIMENTACAO (ID_TipoMovimentacao)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS CUPOM_DESCONTO (
  ID_Cupom           INT NOT NULL AUTO_INCREMENT,
  ID_Estabelecimento INT NOT NULL,
  ID_TipoDesconto    INT NULL,
  Codigo             VARCHAR(50) NOT NULL,
  Valor_Desconto     DECIMAL(10, 2) NOT NULL,
  Data_Validade      DATE NULL,
  Data_Exclusao      TIMESTAMP(6) NULL,
  PRIMARY KEY (ID_Cupom),
  UNIQUE KEY UK_Estabelecimento_Codigo (ID_Estabelecimento, Codigo),
  FOREIGN KEY (ID_Estabelecimento) REFERENCES ESTABELECIMENTO (ID_Estabelecimento),
  FOREIGN KEY (ID_TipoDesconto) REFERENCES TIPO_DESCONTO (ID_TipoDesconto)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS COMANDA (
  ID_Comanda                INT NOT NULL AUTO_INCREMENT,
  ID_Estabelecimento        INT NOT NULL,
  ID_Cupom_Aplicado         INT NULL,
  ID_Status                 INT NOT NULL,
  ID_Tipo_Desconto_Aplicado INT NULL,
  Descricao                 VARCHAR(100) NOT NULL,
  Total                     DECIMAL(10, 2) NOT NULL,
  Valor_Desconto_Aplicado   DECIMAL(10, 2) NULL,
  Data_Abertura             TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (ID_Comanda),
  FOREIGN KEY (ID_Estabelecimento) REFERENCES ESTABELECIMENTO (ID_Estabelecimento),
  FOREIGN KEY (ID_Cupom_Aplicado) REFERENCES CUPOM_DESCONTO (ID_Cupom),
  FOREIGN KEY (ID_Status) REFERENCES STATUS_COMANDA (ID_Status),
  FOREIGN KEY (ID_Tipo_Desconto_Aplicado) REFERENCES TIPO_DESCONTO (ID_TipoDesconto)
) ENGINE = InnoDB;

CREATE INDEX idx_comanda_est_status_data ON COMANDA (ID_Estabelecimento, ID_Status, Data_Abertura);

CREATE TABLE IF NOT EXISTS PEDIDO (
  ID_Pedido              INT NOT NULL AUTO_INCREMENT,
  ID_Comanda             INT NOT NULL,
  ID_Usuario_Cancelador  INT NULL,
  ID_Usuario_Criador     INT NULL,
  ID_Status              INT NOT NULL,
  Observacao             VARCHAR(255) NULL,
  Cancelamento_Descricao VARCHAR(255) NULL,
  Autoatendimento        TINYINT NOT NULL DEFAULT 0,
  Data_Hora_Chegada      TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (ID_Pedido),
  FOREIGN KEY (ID_Comanda) REFERENCES COMANDA (ID_Comanda),
  FOREIGN KEY (ID_Usuario_Cancelador) REFERENCES USUARIO (ID_Usuario),
  FOREIGN KEY (ID_Usuario_Criador) REFERENCES USUARIO (ID_Usuario),
  FOREIGN KEY (ID_Status) REFERENCES STATUS_PEDIDO (ID_Status)
) ENGINE = InnoDB;

CREATE INDEX idx_pedido_comanda_status_data ON PEDIDO (ID_Comanda, ID_Status, Data_Hora_Chegada);

CREATE TABLE IF NOT EXISTS ITEM_PEDIDO (
  ID_Item                INT NOT NULL AUTO_INCREMENT,
  ID_Pedido              INT NULL,
  ID_Produto             INT NULL,
  ID_Variacao            INT NULL,
  Quantidade             INT NOT NULL,
  Preco_Unitario_Momento DECIMAL(10, 2) NOT NULL,
  Observacoes_Cliente    VARCHAR(255) NULL,
  Data_Criacao           TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (ID_Item),
  FOREIGN KEY (ID_Pedido) REFERENCES PEDIDO (ID_Pedido),
  FOREIGN KEY (ID_Produto) REFERENCES PRODUTO (ID_Produto),
  FOREIGN KEY (ID_Variacao) REFERENCES PRODUTO_VARIACAO (ID_Variacao)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS PAGAMENTO (
  ID_Pagamento             INT NOT NULL AUTO_INCREMENT,
  ID_Estabelecimento       INT NOT NULL,
  ID_Usuario_Caixa         INT NULL,
  ID_MetodoPagamento       INT NOT NULL,
  ID_Status                INT NOT NULL,
  Valor_Total              DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  Troco                    DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  ID_Pedido_MercadoPago    VARCHAR(255) NULL,
  ID_Pagamento_MercadoPago VARCHAR(255) NULL,
  Data_Hora_Pagamento      TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  Data_Exclusao            TIMESTAMP(6) NULL,
  PRIMARY KEY (ID_Pagamento),
  FOREIGN KEY (ID_Estabelecimento) REFERENCES ESTABELECIMENTO (ID_Estabelecimento),
  FOREIGN KEY (ID_Usuario_Caixa) REFERENCES USUARIO (ID_Usuario),
  FOREIGN KEY (ID_MetodoPagamento) REFERENCES METODO_PAGAMENTO (ID_MetodoPagamento),
  FOREIGN KEY (ID_Status) REFERENCES STATUS_PAGAMENTO (ID_Status)
) ENGINE = InnoDB;

CREATE INDEX idx_pagamento_est_status_data ON PAGAMENTO (ID_Estabelecimento, ID_Status, Data_Hora_Pagamento);

CREATE TABLE IF NOT EXISTS PAGAMENTO_PEDIDO (
  ID_Pedido               INT NOT NULL,
  ID_Pagamento            INT NOT NULL,
  Valor_Pago_Deste_Pedido DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (ID_Pedido, ID_Pagamento),
  FOREIGN KEY (ID_Pagamento) REFERENCES PAGAMENTO (ID_Pagamento),
  FOREIGN KEY (ID_Pedido) REFERENCES PEDIDO (ID_Pedido)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS NOTA_FISCAL (
  ID_Nota          INT NOT NULL AUTO_INCREMENT,
  ID_Pagamento     INT NOT NULL,
  Numero_Nota      VARCHAR(50) NOT NULL,
  CPF_CNPJ_Cliente VARCHAR(18) NULL,
  ID_Status        INT NOT NULL,
  Valor_Total      DECIMAL(10, 2) NOT NULL,
  Data_Emissao     TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  Data_Exclusao    TIMESTAMP(6) NULL,
  PRIMARY KEY (ID_Nota),
  UNIQUE KEY IDX_53587e2175429674989f61da16 (ID_Pagamento),
  FOREIGN KEY (ID_Pagamento) REFERENCES PAGAMENTO (ID_Pagamento),
  FOREIGN KEY (ID_Status) REFERENCES STATUS_NOTA_FISCAL (ID_Status)
) ENGINE = InnoDB;

INSERT IGNORE INTO PERMISSAO (Nome) VALUES
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

INSERT IGNORE INTO METODO_PAGAMENTO (Nome) VALUES
  ('Dinheiro'),
  ('Débito'),
  ('Crédito'),
  ('Pix'),
  ('Vale Refeição'),
  ('Vale Alimentação');
