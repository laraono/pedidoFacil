-- =========================================================================
-- SETUP INICIAL
-- =========================================================================
CREATE SCHEMA IF NOT EXISTS foodsystem_db DEFAULT CHARACTER SET utf8mb4;
USE foodsystem_db;

-- =========================================================================
-- FASE 1: NÚCLEO DO SISTEMA E ADMINISTRAÇÃO
-- Estas tabelas não dependem de ninguém. São a base do SaaS.
-- =========================================================================

-- Tabela global para quem vai administrar o PedidoFácil (Você)
CREATE TABLE ADMIN (
  ID_Admin INT NOT NULL AUTO_INCREMENT,
  Nome VARCHAR(100) NOT NULL,
  Email VARCHAR(100) NOT NULL UNIQUE,
  Senha VARCHAR(255) NOT NULL,
  PRIMARY KEY (ID_Admin)
) ENGINE = InnoDB;

-- O "Pai" de todos os dados do cliente. Note que o ID_Gerente_Responsavel
-- foi criado, mas a FK será adicionada depois, para evitar loop de dependência.
CREATE TABLE ESTABELECIMENTO (
  ID_Estabelecimento INT NOT NULL AUTO_INCREMENT,
  Nome VARCHAR(100) NOT NULL,
  CNPJ VARCHAR(18) NOT NULL UNIQUE,
  Formas_Atendimento_Habilitadas JSON NULL COMMENT 'Ex: ["Mesa", "Autoatendimento"]',
  Codigo_Autoatendimento VARCHAR(10) NULL UNIQUE COMMENT 'PIN para o App do cliente',
  ID_Gerente_Responsavel INT NULL COMMENT 'Preenchido após criar o Usuário',
  PRIMARY KEY (ID_Estabelecimento)
) ENGINE = InnoDB;

-- Controle 1:1 de estilização. Usado pelo Editor Visual do seu Vue.js.
CREATE TABLE CONFIGURACAO_ESTABELECIMENTO (
  ID_Estabelecimento INT NOT NULL,
  Cor_Fundo_Geral VARCHAR(7) NULL,
  Cor_Cards VARCHAR(7) NULL,
  Cor_Textos VARCHAR(7) NULL,
  Cor_Botoes VARCHAR(7) NULL,
  Texto_Botoes VARCHAR(7) NULL,
  Cor_Categoria_Ativa VARCHAR(7) NULL,
  Fonte VARCHAR(50) NULL,
  Logotipo VARCHAR(255) NULL,
  Label_Comanda VARCHAR(30) NULL COMMENT 'Ex: "Mesa", "Ficha"',
  Permite_Observacoes BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (ID_Estabelecimento),
  FOREIGN KEY (ID_Estabelecimento) REFERENCES ESTABELECIMENTO (ID_Estabelecimento)
) ENGINE = InnoDB;

-- =========================================================================
-- FASE 2: GESTÃO DE ACESSOS (RH)
-- Criação de Cargos e Funcionários atrelados ao Estabelecimento.
-- =========================================================================

-- Cargos e suas permissões em JSON para facilitar a leitura no frontend.
CREATE TABLE CARGO (
  ID_Cargo INT NOT NULL AUTO_INCREMENT,
  ID_Estabelecimento INT NOT NULL,
  Nome VARCHAR(50) NOT NULL,
  Permissoes_JSON JSON NULL COMMENT 'Lista de IDs de permissão',
  PRIMARY KEY (ID_Cargo),
  FOREIGN KEY (ID_Estabelecimento) REFERENCES ESTABELECIMENTO (ID_Estabelecimento)
) ENGINE = InnoDB;

-- O usuário (Caixa, Garçom, Gerente). Pode existir antes de ter um cargo (Pendente).
CREATE TABLE USUARIO (
  ID_Usuario INT NOT NULL AUTO_INCREMENT,
  ID_Estabelecimento INT NULL,
  ID_Cargo INT NULL,
  Nome VARCHAR(100) NOT NULL,
  Email VARCHAR(100) NOT NULL UNIQUE,
  Senha VARCHAR(255) NOT NULL,
  Status ENUM('Ativo', 'Inativo', 'Pendente') NOT NULL DEFAULT 'Pendente',
  PRIMARY KEY (ID_Usuario),
  FOREIGN KEY (ID_Estabelecimento) REFERENCES ESTABELECIMENTO (ID_Estabelecimento),
  FOREIGN KEY (ID_Cargo) REFERENCES CARGO (ID_Cargo)
) ENGINE = InnoDB;

CREATE TABLE REFRESH_TOKEN (
  ID_Token       INT NOT NULL AUTO_INCREMENT,
  Token_Hash     VARCHAR(255) NOT NULL UNIQUE,
  ID_Usuario     INT NOT NULL,
  Expires_At     TIMESTAMP NOT NULL,
  Revogado       BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (ID_Token),
  FOREIGN KEY (ID_Usuario) REFERENCES USUARIO(ID_Usuario) ON DELETE CASCADE
) ENGINE = InnoDB;

-- Resolução do Loop: Agora que a tabela USUARIO existe, amarramos o Gerente ao Estabelecimento.
ALTER TABLE ESTABELECIMENTO
ADD FOREIGN KEY (ID_Gerente_Responsavel) REFERENCES USUARIO (ID_Usuario);

-- =========================================================================
-- FASE 3: ASSINATURAS E FATURAMENTO (SaaS)
-- =========================================================================

CREATE TABLE PLANO (
  ID_Plano INT NOT NULL AUTO_INCREMENT,
  Nome VARCHAR(30) NOT NULL,
  Valor_Plano DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (ID_Plano)
) ENGINE = InnoDB;

CREATE TABLE ASSINATURA (
  ID_Assinatura INT NOT NULL AUTO_INCREMENT,
  ID_Estabelecimento INT NOT NULL,
  ID_Plano INT NOT NULL,
  Data_Inicio DATE NOT NULL,
  Data_Vencimento_Prox DATE NOT NULL,
  Status ENUM('Pendente', 'Pago', 'Expirado', 'Cancelado') NOT NULL,
  Ultima_Data_Pagamento DATE NULL,
  Recibo_URL VARCHAR(255) NULL,
  PRIMARY KEY (ID_Assinatura),
  FOREIGN KEY (ID_Estabelecimento) REFERENCES ESTABELECIMENTO (ID_Estabelecimento),
  FOREIGN KEY (ID_Plano) REFERENCES PLANO (ID_Plano)
) ENGINE = InnoDB;

-- =========================================================================
-- FASE 4: CARDÁPIO, VARIAÇÕES E ESTOQUE
-- Tudo que pode ser vendido no sistema.
-- =========================================================================

CREATE TABLE CATEGORIA (
  ID_Categoria INT NOT NULL AUTO_INCREMENT,
  ID_Estabelecimento INT NOT NULL,
  Nome VARCHAR(100) NOT NULL,
  Data_Exclusao DATETIME NULL COMMENT 'Preenchido se deletado (Soft Delete)',
  PRIMARY KEY (ID_Categoria),
  FOREIGN KEY (ID_Estabelecimento) REFERENCES ESTABELECIMENTO (ID_Estabelecimento)
) ENGINE = InnoDB;

-- O item principal (Ex: Hambúrguer, Cerveja)
CREATE TABLE PRODUTO (
  ID_Produto INT NOT NULL AUTO_INCREMENT,
  ID_Estabelecimento INT NOT NULL,
  ID_Categoria INT NOT NULL,
  Nome VARCHAR(100) NOT NULL,
  Descricao VARCHAR(255) NULL,
  Preco_Base DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  Imagem VARCHAR(255) NULL,
  Status ENUM('Ativo', 'Inativo') NOT NULL DEFAULT 'Ativo' COMMENT 'Controle do gerente',
  Estocavel BOOLEAN NOT NULL,
  Data_Exclusao DATETIME NULL COMMENT 'Auditoria de exclusão',
  PRIMARY KEY (ID_Produto),
  FOREIGN KEY (ID_Estabelecimento) REFERENCES ESTABELECIMENTO (ID_Estabelecimento),
  FOREIGN KEY (ID_Categoria) REFERENCES CATEGORIA (ID_Categoria)
) ENGINE = InnoDB;

-- Tabela Irmã para incrementos de produto (Ex: Adicional de Bacon, Tamanho G)
CREATE TABLE PRODUTO_VARIACAO (
  ID_Variacao INT NOT NULL AUTO_INCREMENT,
  ID_Produto INT NOT NULL,
  Nome VARCHAR(100) NOT NULL COMMENT 'Ex: Bacon, Tamanho G',
  Preco_Adicional DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Somado ao Preco_Base',
  Status ENUM('Ativo', 'Inativo') NOT NULL DEFAULT 'Ativo',
  Data_Exclusao DATETIME NULL,
  PRIMARY KEY (ID_Variacao),
  FOREIGN KEY (ID_Produto) REFERENCES PRODUTO (ID_Produto)
) ENGINE = InnoDB;

CREATE TABLE ESTOQUE_ITEM (
  ID_Estoque_Item INT NOT NULL AUTO_INCREMENT,
  ID_Produto INT NOT NULL,
  Nome VARCHAR(100) NOT NULL,
  Unidade_Medida VARCHAR(20) NOT NULL,
  Quantidade_Atual INT NOT NULL DEFAULT 0,
  PRIMARY KEY (ID_Estoque_Item),
  FOREIGN KEY (ID_Produto) REFERENCES PRODUTO (ID_Produto)
) ENGINE = InnoDB;

CREATE TABLE MOVIMENTACAO_ESTOQUE (
  ID_Movimentacao INT NOT NULL AUTO_INCREMENT,
  ID_Estoque_Item INT NOT NULL,
  ID_Usuario_Responsavel INT NOT NULL,
  Data_Hora DATETIME NOT NULL,
  Tipo_Movimentacao ENUM('Entrada', 'Saida', 'Ajuste') NOT NULL,
  Quantidade INT NOT NULL,
  Justificativa VARCHAR(255) NULL,
  PRIMARY KEY (ID_Movimentacao),
  FOREIGN KEY (ID_Estoque_Item) REFERENCES ESTOQUE_ITEM (ID_Estoque_Item),
  FOREIGN KEY (ID_Usuario_Responsavel) REFERENCES USUARIO (ID_Usuario)
) ENGINE = InnoDB;

-- =========================================================================
-- FASE 5: CUPONS E SESSÕES DE CONSUMO (COMANDAS)
-- Controle de quem está no restaurante comprando.
-- =========================================================================

CREATE TABLE CUPOM_DESCONTO (
  ID_Cupom INT NOT NULL AUTO_INCREMENT,
  ID_Estabelecimento INT NOT NULL,
  Codigo VARCHAR(50) NOT NULL,
  Tipo_Desconto ENUM('Valor', 'Percentual') NOT NULL,
  Valor_Desconto DECIMAL(10, 2) NOT NULL,
  Quantidade_Disponivel INT NULL,
  Data_Validade DATE NULL,
  PRIMARY KEY (ID_Cupom),
  UNIQUE KEY UK_Estabelecimento_Codigo (ID_Estabelecimento, Codigo),
  FOREIGN KEY (ID_Estabelecimento) REFERENCES ESTABELECIMENTO (ID_Estabelecimento)
) ENGINE = InnoDB;

-- A Comanda é o guarda-chuva. Agrupa todos os pedidos de uma mesa/cliente.
CREATE TABLE COMANDA (
  ID_Comanda INT NOT NULL AUTO_INCREMENT,
  ID_Estabelecimento INT NOT NULL,
  Descricao VARCHAR(100) NOT NULL COMMENT 'Ex: Mesa 10',
  Data_Abertura DATETIME NOT NULL,
  Status ENUM('Aberta', 'Fechada', 'Cancelada') NOT NULL DEFAULT 'Aberta',
  ID_Usuario_Abertura INT NULL,
  ID_Cupom_Aplicado INT NULL COMMENT 'Desconto aplicado na sessão inteira',
  Valor_Desconto_Aplicado DECIMAL(10, 2) NULL,
  Tipo_Desconto_Aplicado ENUM('Valor', 'Percentual') NULL,
  PRIMARY KEY (ID_Comanda),
  FOREIGN KEY (ID_Estabelecimento) REFERENCES ESTABELECIMENTO (ID_Estabelecimento),
  FOREIGN KEY (ID_Usuario_Abertura) REFERENCES USUARIO (ID_Usuario),
  FOREIGN KEY (ID_Cupom_Aplicado) REFERENCES CUPOM_DESCONTO (ID_Cupom)
) ENGINE = InnoDB;

-- =========================================================================
-- FASE 6: CICLO DO PEDIDO (O QUE VAI PARA A COZINHA)
-- =========================================================================

-- O momento em que o garçom clica em "Enviar para Cozinha" gera 1 Pedido.
CREATE TABLE PEDIDO (
  ID_Pedido INT NOT NULL AUTO_INCREMENT,
  ID_Estabelecimento INT NOT NULL,
  ID_Comanda INT NOT NULL,
  Data_Hora_Chegada DATETIME NOT NULL,
  Status ENUM('Aguardando preparo', 'Em progresso', 'Pronto', 'Cancelado', 'Finalizado') NOT NULL,
  Tipo_Atendimento ENUM('Garcom', 'Caixa', 'Autoatendimento') NOT NULL,
  Observacoes_Geral VARCHAR(255) NULL,
  Custo_Adicional_Viagem DECIMAL(10, 2) NULL,
  Cancelamento_Descricao VARCHAR(255) NULL,
  ID_Usuario_Cancelador INT NULL,
  seEntregue BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (ID_Pedido),
  FOREIGN KEY (ID_Estabelecimento) REFERENCES ESTABELECIMENTO (ID_Estabelecimento),
  FOREIGN KEY (ID_Comanda) REFERENCES COMANDA (ID_Comanda),
  FOREIGN KEY (ID_Usuario_Cancelador) REFERENCES USUARIO (ID_Usuario)
) ENGINE = InnoDB;

-- Os produtos individuais daquele Pedido.
CREATE TABLE ITEM_PEDIDO (
  ID_Item_Pedido INT NOT NULL AUTO_INCREMENT,
  ID_Pedido INT NOT NULL,
  ID_Produto INT NOT NULL,
  Quantidade INT NOT NULL,
  Preco_Unitario_Momento DECIMAL(10, 2) NOT NULL COMMENT 'Congela o preço no ato da compra',
  Observacoes_Cliente VARCHAR(255) NULL COMMENT 'Ex: Sem cebola',
  PRIMARY KEY (ID_Item_Pedido),
  FOREIGN KEY (ID_Pedido) REFERENCES PEDIDO (ID_Pedido),
  FOREIGN KEY (ID_Produto) REFERENCES PRODUTO (ID_Produto)
) ENGINE = InnoDB;

-- Tabela crucial: Liga as variações ecolhidas ao item exato do pedido.
CREATE TABLE ITEM_PEDIDO_VARIACAO (
  ID_Item_Variacao INT NOT NULL AUTO_INCREMENT,
  ID_Item_Pedido INT NOT NULL,
  ID_Variacao INT NOT NULL,
  Preco_Adicional_Momento DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Congela o preço do adicional',
  PRIMARY KEY (ID_Item_Variacao),
  FOREIGN KEY (ID_Item_Pedido) REFERENCES ITEM_PEDIDO (ID_Item_Pedido),
  FOREIGN KEY (ID_Variacao) REFERENCES PRODUTO_VARIACAO (ID_Variacao)
) ENGINE = InnoDB;

-- =========================================================================
-- FASE 7: TRANSAÇÕES FINANCEIRAS
-- =========================================================================

-- O ato de passar o cartão ou receber o Pix.
CREATE TABLE PAGAMENTO (
  ID_Pagamento INT NOT NULL AUTO_INCREMENT,
  ID_Estabelecimento INT NOT NULL,
  ID_Caixa INT NULL COMMENT 'Quem recebeu o dinheiro',
  Data_Hora_Pagamento DATETIME NOT NULL,
  Valor_Total DECIMAL(10, 2) NOT NULL,
  Valor_Taxa_Servico DECIMAL(10, 2) NULL,
  Forma_Pagamento VARCHAR(50) NOT NULL,
  Troco DECIMAL(10, 2) NULL,
  PRIMARY KEY (ID_Pagamento),
  FOREIGN KEY (ID_Estabelecimento) REFERENCES ESTABELECIMENTO (ID_Estabelecimento),
  FOREIGN KEY (ID_Caixa) REFERENCES USUARIO (ID_Usuario)
) ENGINE = InnoDB;

-- Permite pagar parte de um pedido ou juntar vários pedidos num pagamento só.
CREATE TABLE PAGAMENTO_PEDIDO (
  ID_Pagamento INT NOT NULL,
  ID_Pedido INT NOT NULL,
  Valor_Pago_Deste_Pedido DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (ID_Pagamento, ID_Pedido),
  FOREIGN KEY (ID_Pagamento) REFERENCES PAGAMENTO (ID_Pagamento),
  FOREIGN KEY (ID_Pedido) REFERENCES PEDIDO (ID_Pedido)
) ENGINE = InnoDB;

-- Fechamento fiscal atrelado à transação.
CREATE TABLE NOTA_FISCAL (
  ID_Nota INT NOT NULL AUTO_INCREMENT,
  ID_Pagamento INT NOT NULL UNIQUE,
  Numero_Nota VARCHAR(100) NOT NULL,
  Data_Emissao DATETIME NOT NULL,
  CPF_CNPJ_Cliente VARCHAR(18) NULL,
  PRIMARY KEY (ID_Nota),
  FOREIGN KEY (ID_Pagamento) REFERENCES PAGAMENTO (ID_Pagamento)
) ENGINE = InnoDB;