-- SCRIPT DDL FINAL E COMPLETO (MODELO LIMPO E MODULAR)
-- Separação da estilização (UI/UX) em uma tabela própria.

-- -----------------------------------------------------------
-- CONFIGURAÇÃO INICIAL E LIMPEZA
-- -----------------------------------------------------------
DROP SCHEMA IF EXISTS `foodsystem_db`;
CREATE SCHEMA IF NOT EXISTS `foodsystem_db` DEFAULT CHARACTER SET utf8mb4;
USE `foodsystem_db`;

-- -----------------------------------------------------------
-- 1. ENTIDADES DE PLATAFORMA (ADMIN)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ADMIN` (
  `ID_Admin` INT NOT NULL AUTO_INCREMENT,
  `Nome` VARCHAR(100) NOT NULL,
  `Email` VARCHAR(100) NOT NULL UNIQUE,
  `Senha` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`ID_Admin`)
) ENGINE = InnoDB;

-- -----------------------------------------------------------
-- 2. ESTRUTURA BASE (USUARIO, CARGO, ESTABELECIMENTO)
-- -----------------------------------------------------------

CREATE TABLE IF NOT EXISTS `ESTABELECIMENTO` (
  `ID_Estabelecimento` INT NOT NULL AUTO_INCREMENT,
  `Nome` VARCHAR(100) NOT NULL,
  `CNPJ` VARCHAR(18) NOT NULL UNIQUE,
  `Formas_Atendimento_Habilitadas` JSON NULL,
  `ID_Gerente_Responsavel` INT NULL COMMENT 'FK para a tabela USUARIO',
  PRIMARY KEY (`ID_Estabelecimento`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `CONFIGURACAO_ESTABELECIMENTO` (
  -- Tabela 1:1 com ESTABELECIMENTO
  `ID_Estabelecimento` INT NOT NULL,
  `Cor_Fundo` VARCHAR(7) NULL,
  `Fonte` VARCHAR(50) NULL,
  `Tamanho_Fonte` INT NULL,
  `Logotipo` VARCHAR(255) NULL,
  PRIMARY KEY (`ID_Estabelecimento`),
  FOREIGN KEY (`ID_Estabelecimento`) REFERENCES `ESTABELECIMENTO` (`ID_Estabelecimento`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `CARGO` (
  `ID_Cargo` INT NOT NULL AUTO_INCREMENT,
  `ID_Estabelecimento` INT NOT NULL,
  `Nome` VARCHAR(50) NOT NULL,
  `Permissoes_JSON` JSON NULL,
  PRIMARY KEY (`ID_Cargo`),
  FOREIGN KEY (`ID_Estabelecimento`) REFERENCES `ESTABELECIMENTO` (`ID_Estabelecimento`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `USUARIO` (
  `ID_Usuario` INT NOT NULL AUTO_INCREMENT,
  `ID_Estabelecimento` INT NULL, 
  `ID_Cargo` INT NULL, 
  `Nome` VARCHAR(100) NOT NULL,
  `Email` VARCHAR(100) NOT NULL UNIQUE,
  `Senha` VARCHAR(255) NOT NULL,
  `Status` ENUM('Ativo', 'Inativo', 'Pendente') NOT NULL DEFAULT 'Pendente', 
  PRIMARY KEY (`ID_Usuario`),
  FOREIGN KEY (`ID_Estabelecimento`) REFERENCES `ESTABELECIMENTO` (`ID_Estabelecimento`),
  FOREIGN KEY (`ID_Cargo`) REFERENCES `CARGO` (`ID_Cargo`)
) ENGINE = InnoDB;

-- Finaliza o loop: ID_Gerente_Responsavel aponta para USUARIO
ALTER TABLE `ESTABELECIMENTO`
ADD FOREIGN KEY (`ID_Gerente_Responsavel`) REFERENCES `USUARIO` (`ID_Usuario`);


-- -----------------------------------------------------------
-- 3. ENTIDADES DE ASSINATURA E COMANDA
-- -----------------------------------------------------------

CREATE TABLE IF NOT EXISTS ‘PLANO’ (
  ‘ID_Plano’ INT NOT NULL AUTO_INCREMENT,
  ‘Nome’ VARCHAR(30) NOT NULL,
  `Valor_Plano` DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (‘ID_Plano’)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `ASSINATURA` (
  `ID_Assinatura` INT NOT NULL AUTO_INCREMENT,
  `ID_Estabelecimento` INT NOT NULL,
  ‘ID_Plano’ INT NOT NULL,
  `Data_Inicio` DATE NOT NULL,
  `Data_Vencimento_Prox` DATE NOT NULL,
  `Status` ENUM('Pendente', 'Pago', 'Expirado', 'Cancelado') NOT NULL,
  `Ultima_Data_Pagamento` DATE NULL,
  `Recibo_URL` VARCHAR(255) NULL,
  PRIMARY KEY (`ID_Assinatura`),
  FOREIGN KEY (`ID_Estabelecimento`) REFERENCES `ESTABELECIMENTO` (`ID_Estabelecimento`),
FOREIGN KEY (`ID_Plano`) REFERENCES `PLANO` (`ID_Plano`)

) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `COMANDA` (
  `ID_Comanda` INT NOT NULL AUTO_INCREMENT,
  `ID_Estabelecimento` INT NOT NULL,
  `Descricao` VARCHAR(100) NOT NULL COMMENT 'Ex: "Mesa 9", "Cliente Lucas"',
  `Data_Abertura` DATETIME NOT NULL,
  `Status` ENUM('Aberta', 'Fechada', 'Cancelada') NOT NULL DEFAULT 'Aberta',
  `ID_Usuario_Abertura` INT NULL COMMENT 'Garçom/Caixa que iniciou a comanda',
  PRIMARY KEY (`ID_Comanda`),
  FOREIGN KEY (`ID_Estabelecimento`) REFERENCES `ESTABELECIMENTO` (`ID_Estabelecimento`),
  FOREIGN KEY (`ID_Usuario_Abertura`) REFERENCES `USUARIO` (`ID_Usuario`)
) ENGINE = InnoDB;


-- -----------------------------------------------------------
-- 4. ENTIDADES DE CONFIGURAÇÃO DE PRODUTOS E ESTOQUE
-- -----------------------------------------------------------

CREATE TABLE IF NOT EXISTS `CATEGORIA` (
  `ID_Categoria` INT NOT NULL AUTO_INCREMENT,
  `ID_Estabelecimento` INT NOT NULL,
  `Nome` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`ID_Categoria`),
  FOREIGN KEY (`ID_Estabelecimento`) REFERENCES `ESTABELECIMENTO` (`ID_Estabelecimento`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `PRODUTO` (
  `ID_Produto` INT NOT NULL AUTO_INCREMENT,
  `ID_Estabelecimento` INT NOT NULL,
  `ID_Categoria` INT NOT NULL,
  `Nome` VARCHAR(100) NOT NULL,
  `Descricao` VARCHAR(255) NULL,
  `Preco` DECIMAL(10, 2) NOT NULL,
  `Imagem` VARCHAR(255) NULL,
  `Status` ENUM('Ativo', 'Inativo') NOT NULL DEFAULT 'Ativo',
  ‘Estocavel’ BOOLEAN NOT NULL,
  PRIMARY KEY (`ID_Produto`),
  FOREIGN KEY (`ID_Estabelecimento`) REFERENCES `ESTABELECIMENTO` (`ID_Estabelecimento`),
  FOREIGN KEY (`ID_Categoria`) REFERENCES `CATEGORIA` (`ID_Categoria`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `CUPOM_DESCONTO` (
  `ID_Cupom` INT NOT NULL AUTO_INCREMENT,
  `ID_Estabelecimento` INT NOT NULL,
  `Codigo` VARCHAR(50) NOT NULL,
  `Tipo_Desconto` ENUM('Valor', 'Percentual') NOT NULL,
  `Valor_Desconto` DECIMAL(10, 2) NOT NULL,
  `Quantidade_Disponivel` INT NULL,
  `Data_Validade` DATE NULL,
  PRIMARY KEY (`ID_Cupom`),
  UNIQUE KEY `UK_Estabelecimento_Codigo` (`ID_Estabelecimento`, `Codigo`),
  FOREIGN KEY (`ID_Estabelecimento`) REFERENCES `ESTABELECIMENTO` (`ID_Estabelecimento`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `ESTOQUE_ITEM` (
  `ID_Produto` INT NOT NULL AUTO_INCREMENT,
  `Nome` VARCHAR(100) NOT NULL,
  `Unidade_Medida` VARCHAR(20) NOT NULL,
  `Quantidade_Atual` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`ID_Estoque_Item`),
  FOREIGN KEY (`ID_Produto`) REFERENCES `PRODUTO` (`ID_Produto`)
) ENGINE = InnoDB;


-- -----------------------------------------------------------
-- 5. ENTIDADES DE TRANSAÇÃO (PEDIDOS E PAGAMENTOS)
-- -----------------------------------------------------------

CREATE TABLE IF NOT EXISTS `PEDIDO` (
  `ID_Pedido` INT NOT NULL AUTO_INCREMENT,
  `ID_Estabelecimento` INT NOT NULL,
  `ID_Comanda` INT NOT NULL, 
  `Data_Hora_Chegada` DATETIME NOT NULL,
  `Status` ENUM('Aguardando preparo', 'Em progresso', 'Pronto', 'Cancelado', 'Finalizado') NOT NULL,
  `Tipo_Atendimento` ENUM('Garcom', 'Caixa', 'Autoatendimento') NOT NULL,
  `Observacoes_Geral` VARCHAR(255) NULL,
  `Custo_Adicional_Viagem` DECIMAL(10, 2) NULL,
  `Cancelamento_Descricao` VARCHAR(255) NULL,
  `ID_Usuario_Cancelador` INT NULL,
  `seEntregue` INT NULL,   
  PRIMARY KEY (`ID_Pedido`),
  FOREIGN KEY (`ID_Estabelecimento`) REFERENCES `ESTABELECIMENTO` (`ID_Estabelecimento`),
  FOREIGN KEY (`ID_Comanda`) REFERENCES `COMANDA` (`ID_Comanda`),
  FOREIGN KEY (`ID_Usuario_Cancelador`) REFERENCES `USUARIO` (`ID_Usuario`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `ITEM_PEDIDO` (
  `ID_Item_Pedido` INT NOT NULL AUTO_INCREMENT,
  `ID_Pedido` INT NOT NULL,
  `ID_Produto` INT NOT NULL,
  `Quantidade` INT NOT NULL,
  `Observacoes` VARCHAR(255) NULL,
  `Preco_Unitario_Momento` DECIMAL(10, 2) NOT NULL,
  
  PRIMARY KEY (`ID_Item_Pedido`),
  FOREIGN KEY (`ID_Pedido`) REFERENCES `PEDIDO` (`ID_Pedido`),
  FOREIGN KEY (`ID_Produto`) REFERENCES `PRODUTO` (`ID_Produto`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `PAGAMENTO` (
  `ID_Pagamento` INT NOT NULL AUTO_INCREMENT,
  `ID_Estabelecimento` INT NOT NULL,
  `ID_Caixa` INT NULL,
  `Data_Hora_Pagamento` DATETIME NOT NULL,
  `Valor_Total` DECIMAL(10, 2) NOT NULL,
  `Valor_Taxa_Servico` DECIMAL(10, 2) NULL,
  `ID_Cupom_Aplicado` INT NULL,
  `Forma_Pagamento` VARCHAR(50) NOT NULL,
  `Troco` DECIMAL(10, 2) NULL,
  
  PRIMARY KEY (`ID_Pagamento`),
  FOREIGN KEY (`ID_Estabelecimento`) REFERENCES `ESTABELECIMENTO` (`ID_Estabelecimento`),
  FOREIGN KEY (`ID_Caixa`) REFERENCES `USUARIO` (`ID_Usuario`),
  FOREIGN KEY (`ID_Cupom_Aplicado`) REFERENCES `CUPOM_DESCONTO` (`ID_Cupom`)

) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `PAGAMENTO_PEDIDO` (
  `ID_Pagamento` INT NOT NULL,
  `ID_Pedido` INT NOT NULL,
  `Valor_Pago_Deste_Pedido` DECIMAL(10, 2) NOT NULL,
  
  PRIMARY KEY (`ID_Pagamento`, `ID_Pedido`),
  FOREIGN KEY (`ID_Pagamento`) REFERENCES `PAGAMENTO` (`ID_Pagamento`),
  FOREIGN KEY (`ID_Pedido`) REFERENCES `PEDIDO` (`ID_Pedido`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `NOTA_FISCAL` (
  `ID_Nota` INT NOT NULL AUTO_INCREMENT,
  `ID_Pagamento` INT NOT NULL UNIQUE,
  `Numero_Nota` VARCHAR(100) NOT NULL,
  `Data_Emissao` DATETIME NOT NULL,
  `CPF_CNPJ_Cliente` VARCHAR(18) NULL,
  PRIMARY KEY (`ID_Nota`),
  FOREIGN KEY (`ID_Pagamento`) REFERENCES `PAGAMENTO` (`ID_Pagamento`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `MOVIMENTACAO_ESTOQUE` (
  `ID_Movimentacao` INT NOT NULL AUTO_INCREMENT,
  `ID_Estoque_Item` INT NOT NULL,
  `ID_Usuario_Responsavel` INT NOT NULL,
  `Data_Hora` DATETIME NOT NULL,
  `Tipo_Movimentacao` ENUM('Entrada', 'Saida', 'Ajuste') NOT NULL,
  `Quantidade` INT NOT NULL,
  `Justificativa` VARCHAR(255) NULL,
  PRIMARY KEY (`ID_Movimentacao`),
  FOREIGN KEY (`ID_Estoque_Item`) REFERENCES `ESTOQUE_ITEM` (`ID_Estoque_Item`),
  FOREIGN KEY (`ID_Usuario_Responsavel`) REFERENCES `USUARIO` (`ID_Usuario`)
) ENGINE = InnoDB;
