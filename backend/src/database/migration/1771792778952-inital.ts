import { MigrationInterface, QueryRunner } from "typeorm";

export class Inital1771792778952 implements MigrationInterface {
    name = 'Inital1771792778952'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`PLANO\` (\`ID_Plano\` int NOT NULL AUTO_INCREMENT, \`Nome\` varchar(30) NOT NULL, \`Valor_Plano\` decimal(10,2) NOT NULL, PRIMARY KEY (\`ID_Plano\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`CARGO\` (\`ID_Cargo\` int NOT NULL AUTO_INCREMENT, \`Nome\` varchar(50) NOT NULL, \`Permissoes_JSON\` json NULL, \`ID_Estabelecimento\` int NULL, PRIMARY KEY (\`ID_Cargo\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`COMANDA\` (\`ID_Comanda\` int NOT NULL AUTO_INCREMENT, \`Descricao\` varchar(100) NOT NULL, \`Data_Inicio\` datetime NOT NULL, \`Status\` varchar(18) NOT NULL, \`ID_Usuario_Abertura\` int NULL, \`ID_Estabelecimento\` int NULL, PRIMARY KEY (\`ID_Comanda\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`CATEGORIA\` (\`ID_Categoria\` int NOT NULL AUTO_INCREMENT, \`Nome\` varchar(100) NOT NULL, \`ID_Estabelecimento\` int NULL, PRIMARY KEY (\`ID_Categoria\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`MOVIMENTACAO_ESTOQUE\` (\`ID_Movimentacao\` int NOT NULL AUTO_INCREMENT, \`Quantidade\` int NOT NULL, \`Justificativa\` varchar(255) NULL, \`Tipo_Movimentacao\` varchar(25) NULL, \`Data_Hora\` datetime NOT NULL, \`ID_Estoque_Item\` int NULL, \`ID_Usuario_Responsavel\` int NULL, PRIMARY KEY (\`ID_Movimentacao\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`ESTOQUE_ITEM\` (\`ID_Produto\` int NOT NULL, \`Nome\` varchar(100) NOT NULL, \`Unidade_Medida\` varchar(20) NOT NULL, \`Quantidade_Atual\` int NOT NULL DEFAULT '0', \`Quantidade_Disponivel\` int NULL, PRIMARY KEY (\`ID_Produto\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`PRODUTO\` (\`ID_Produto\` int NOT NULL AUTO_INCREMENT, \`Nome\` varchar(100) NOT NULL, \`Descricao\` varchar(255) NULL, \`Preco\` decimal(10,2) NOT NULL, \`Imagem\` varchar(255) NOT NULL, \`Status\` varchar(25) NULL, \`Estocavel\` tinyint NOT NULL, \`ID_Categoria\` int NULL, \`ID_Estabelecimento\` int NULL, PRIMARY KEY (\`ID_Produto\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`ITEM_PEDIDO\` (\`ID_Item_Pedido\` int NOT NULL, \`Observacoes\` varchar(20) NULL, \`Quantidade\` int NOT NULL DEFAULT '0', \`Preco_Unitario_Momento\` decimal(10,2) NOT NULL, \`ID_Produto\` int NULL, \`ID_Pedido\` int NULL, PRIMARY KEY (\`ID_Item_Pedido\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`CUPOM_DESCONTO\` (\`ID_Cupom\` int NOT NULL AUTO_INCREMENT, \`Codigo\` varchar(50) NOT NULL, \`Tipo_Desconto\` varchar(20) NOT NULL, \`Valor_Desconto\` decimal(10,2) NOT NULL, \`Quantidade_Disponivel\` int NULL, \`Data_Validade\` date NULL, \`ID_Estabelecimento\` int NULL, UNIQUE INDEX \`IDX_308e5daa9c4dac8eea423a0257\` (\`ID_Estabelecimento\`, \`Codigo\`), PRIMARY KEY (\`ID_Cupom\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`NOTA_FISCAL\` (\`ID_Nota\` int NOT NULL AUTO_INCREMENT, \`Numero_Nota\` varchar(100) NOT NULL, \`CPF_CNPJ_Cliente\` varchar(18) NULL, \`Data_Emissao\` datetime NOT NULL, \`ID_Pagamento\` int NULL, UNIQUE INDEX \`REL_53587e2175429674989f61da16\` (\`ID_Pagamento\`), PRIMARY KEY (\`ID_Nota\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`PAGAMENTO\` (\`ID_Pagamento\` int NOT NULL AUTO_INCREMENT, \`Valor_Total\` decimal(10,2) NOT NULL, \`Valor_Taxa_Servico\` decimal(10,2) NULL, \`Troco\` decimal(10,2) NULL, \`Forma_Pagamento\` varchar(50) NOT NULL, \`Data_Hora_Pagamento\` datetime NOT NULL, \`ID_Cupom_Aplicado\` int NULL, \`ID_Caixa\` int NULL, \`ID_Estabelecimento\` int NULL, PRIMARY KEY (\`ID_Pagamento\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`PAGAMENTO_PEDIDO\` (\`ID_Pagamento\` int NOT NULL, \`ID_Pedido\` int NOT NULL, \`Valor_Pago_Deste_Pedido\` decimal(10,2) NOT NULL, PRIMARY KEY (\`ID_Pagamento\`, \`ID_Pedido\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`PEDIDO\` (\`ID_Pedido\` int NOT NULL AUTO_INCREMENT, \`Descricao\` varchar(255) NULL, \`Custo_Adicional_Viagem\` decimal(10,2) NOT NULL, \`Observacoes_Geral\` varchar(255) NOT NULL, \`Cancelamento_Geral\` varchar(255) NOT NULL, \`Status\` varchar(25) NULL, \`Tipo_Atendimento\` varchar(25) NULL, \`Data_Hora_Chegada\` datetime NOT NULL, \`seEntregue\` int NOT NULL, \`ID_Comanda\` int NULL, \`ID_Usuario_Cancelador\` int NULL, \`ID_Estabelecimento\` int NULL, PRIMARY KEY (\`ID_Pedido\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`USUARIO\` (\`ID_Usuario\` int NOT NULL AUTO_INCREMENT, \`nome\` varchar(100) NOT NULL, \`email\` varchar(100) NOT NULL, \`cpf\` varchar(15) NOT NULL, \`senha\` varchar(255) NOT NULL, \`status\` tinyint NOT NULL, \`ID_Cargo\` int NULL, UNIQUE INDEX \`IDX_77647cbaae451fa5007add2a3e\` (\`email\`), PRIMARY KEY (\`ID_Usuario\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`CONFIGURACAO_ESTABELECIMENTO\` (\`ID_Estabelecimento\` int NOT NULL, \`Cor_Fundo\` varchar(7) NULL, \`Fonte\` varchar(50) NULL, \`Tamanho_Fonte\` int NULL, \`Logotipo\` varchar(255) NOT NULL, PRIMARY KEY (\`ID_Estabelecimento\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`ESTABELECIMENTO\` (\`ID_Estabelecimento\` int NOT NULL AUTO_INCREMENT, \`Nome\` varchar(100) NOT NULL, \`CNPJ\` varchar(18) NOT NULL, \`Status\` varchar(18) NOT NULL, \`Formas_Atendimento_Habilitadas\` json NOT NULL, \`Metodos_Pagamento\` json NOT NULL, \`ID_Gerente_Responsavel\` int NULL, UNIQUE INDEX \`REL_28e1d2575f8a94cc6b4264c57b\` (\`ID_Gerente_Responsavel\`), PRIMARY KEY (\`ID_Estabelecimento\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`ASSINATURA\` (\`ID_Assinatura\` int NOT NULL AUTO_INCREMENT, \`Data_Inicio\` date NOT NULL, \`Data_Vencimento_Prox\` date NOT NULL, \`Status\` varchar(18) NOT NULL, \`Ultima_Data_Pagamento\` date NULL, \`Recibo_URL\` varchar(255) NULL, \`ID_Plano\` int NULL, \`ID_Estabelecimento\` int NULL, PRIMARY KEY (\`ID_Assinatura\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`CARGO\` ADD CONSTRAINT \`FK_94256e68a5d0c2294defa3f7022\` FOREIGN KEY (\`ID_Estabelecimento\`) REFERENCES \`ESTABELECIMENTO\`(\`ID_Estabelecimento\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`COMANDA\` ADD CONSTRAINT \`FK_67b2e47de00a6df9bce7b47862d\` FOREIGN KEY (\`ID_Usuario_Abertura\`) REFERENCES \`USUARIO\`(\`ID_Usuario\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`COMANDA\` ADD CONSTRAINT \`FK_6fd5f78c80915b4c9ef90a62f40\` FOREIGN KEY (\`ID_Estabelecimento\`) REFERENCES \`ESTABELECIMENTO\`(\`ID_Estabelecimento\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`CATEGORIA\` ADD CONSTRAINT \`FK_c28aee109023f1b56998424532f\` FOREIGN KEY (\`ID_Estabelecimento\`) REFERENCES \`ESTABELECIMENTO\`(\`ID_Estabelecimento\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`MOVIMENTACAO_ESTOQUE\` ADD CONSTRAINT \`FK_acfd44433e0e71247c2c0f83605\` FOREIGN KEY (\`ID_Estoque_Item\`) REFERENCES \`ESTOQUE_ITEM\`(\`ID_Produto\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`MOVIMENTACAO_ESTOQUE\` ADD CONSTRAINT \`FK_57c345ee238785058affea4b5cd\` FOREIGN KEY (\`ID_Usuario_Responsavel\`) REFERENCES \`USUARIO\`(\`ID_Usuario\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ESTOQUE_ITEM\` ADD CONSTRAINT \`FK_8c186d01380c5905737f56e8489\` FOREIGN KEY (\`ID_Produto\`) REFERENCES \`PRODUTO\`(\`ID_Produto\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`PRODUTO\` ADD CONSTRAINT \`FK_711a41c3de8cfee194fa18b00eb\` FOREIGN KEY (\`ID_Categoria\`) REFERENCES \`CATEGORIA\`(\`ID_Categoria\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`PRODUTO\` ADD CONSTRAINT \`FK_3a113ffe3a2042755e54120f957\` FOREIGN KEY (\`ID_Estabelecimento\`) REFERENCES \`ESTABELECIMENTO\`(\`ID_Estabelecimento\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ITEM_PEDIDO\` ADD CONSTRAINT \`FK_d250e7a6b910ce68e7e6eeffc8a\` FOREIGN KEY (\`ID_Produto\`) REFERENCES \`PRODUTO\`(\`ID_Produto\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ITEM_PEDIDO\` ADD CONSTRAINT \`FK_dea4c4df3558a6bf4a799aa4773\` FOREIGN KEY (\`ID_Pedido\`) REFERENCES \`PEDIDO\`(\`ID_Pedido\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`CUPOM_DESCONTO\` ADD CONSTRAINT \`FK_577007b2f099c57ac0a959d2345\` FOREIGN KEY (\`ID_Estabelecimento\`) REFERENCES \`ESTABELECIMENTO\`(\`ID_Estabelecimento\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`NOTA_FISCAL\` ADD CONSTRAINT \`FK_53587e2175429674989f61da160\` FOREIGN KEY (\`ID_Pagamento\`) REFERENCES \`PAGAMENTO\`(\`ID_Pagamento\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`PAGAMENTO\` ADD CONSTRAINT \`FK_503d948e41439503a637f146d75\` FOREIGN KEY (\`ID_Cupom_Aplicado\`) REFERENCES \`CUPOM_DESCONTO\`(\`ID_Cupom\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`PAGAMENTO\` ADD CONSTRAINT \`FK_0d0c575f48a4fe678173148156d\` FOREIGN KEY (\`ID_Caixa\`) REFERENCES \`USUARIO\`(\`ID_Usuario\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`PAGAMENTO\` ADD CONSTRAINT \`FK_7e6ba2c9056373e4c762799eaa3\` FOREIGN KEY (\`ID_Estabelecimento\`) REFERENCES \`ESTABELECIMENTO\`(\`ID_Estabelecimento\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`PAGAMENTO_PEDIDO\` ADD CONSTRAINT \`FK_e1a1fa819701e6f06816a8b78c9\` FOREIGN KEY (\`ID_Pagamento\`) REFERENCES \`PAGAMENTO\`(\`ID_Pagamento\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`PAGAMENTO_PEDIDO\` ADD CONSTRAINT \`FK_85ef99f6f9e459a32f2c2fd078a\` FOREIGN KEY (\`ID_Pedido\`) REFERENCES \`PEDIDO\`(\`ID_Pedido\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`PEDIDO\` ADD CONSTRAINT \`FK_a2419e69b50e597ce7e5a7df7e7\` FOREIGN KEY (\`ID_Comanda\`) REFERENCES \`COMANDA\`(\`ID_Comanda\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`PEDIDO\` ADD CONSTRAINT \`FK_5fea249bad2983b6781c52342fa\` FOREIGN KEY (\`ID_Usuario_Cancelador\`) REFERENCES \`USUARIO\`(\`ID_Usuario\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`PEDIDO\` ADD CONSTRAINT \`FK_722d10cf968f927fa833f539133\` FOREIGN KEY (\`ID_Estabelecimento\`) REFERENCES \`ESTABELECIMENTO\`(\`ID_Estabelecimento\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`USUARIO\` ADD CONSTRAINT \`FK_5ab96b45f71c286111960f800ce\` FOREIGN KEY (\`ID_Cargo\`) REFERENCES \`CARGO\`(\`ID_Cargo\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`CONFIGURACAO_ESTABELECIMENTO\` ADD CONSTRAINT \`FK_a42abc8787974640c8df84198c6\` FOREIGN KEY (\`ID_Estabelecimento\`) REFERENCES \`ESTABELECIMENTO\`(\`ID_Estabelecimento\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ESTABELECIMENTO\` ADD CONSTRAINT \`FK_28e1d2575f8a94cc6b4264c57b1\` FOREIGN KEY (\`ID_Gerente_Responsavel\`) REFERENCES \`USUARIO\`(\`ID_Usuario\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ASSINATURA\` ADD CONSTRAINT \`FK_06a24908fb114bdb90d20d9f7da\` FOREIGN KEY (\`ID_Plano\`) REFERENCES \`PLANO\`(\`ID_Plano\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ASSINATURA\` ADD CONSTRAINT \`FK_49ffbd5130542196a401fb27386\` FOREIGN KEY (\`ID_Estabelecimento\`) REFERENCES \`ESTABELECIMENTO\`(\`ID_Estabelecimento\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`ASSINATURA\` DROP FOREIGN KEY \`FK_49ffbd5130542196a401fb27386\``);
        await queryRunner.query(`ALTER TABLE \`ASSINATURA\` DROP FOREIGN KEY \`FK_06a24908fb114bdb90d20d9f7da\``);
        await queryRunner.query(`ALTER TABLE \`ESTABELECIMENTO\` DROP FOREIGN KEY \`FK_28e1d2575f8a94cc6b4264c57b1\``);
        await queryRunner.query(`ALTER TABLE \`CONFIGURACAO_ESTABELECIMENTO\` DROP FOREIGN KEY \`FK_a42abc8787974640c8df84198c6\``);
        await queryRunner.query(`ALTER TABLE \`USUARIO\` DROP FOREIGN KEY \`FK_5ab96b45f71c286111960f800ce\``);
        await queryRunner.query(`ALTER TABLE \`PEDIDO\` DROP FOREIGN KEY \`FK_722d10cf968f927fa833f539133\``);
        await queryRunner.query(`ALTER TABLE \`PEDIDO\` DROP FOREIGN KEY \`FK_5fea249bad2983b6781c52342fa\``);
        await queryRunner.query(`ALTER TABLE \`PEDIDO\` DROP FOREIGN KEY \`FK_a2419e69b50e597ce7e5a7df7e7\``);
        await queryRunner.query(`ALTER TABLE \`PAGAMENTO_PEDIDO\` DROP FOREIGN KEY \`FK_85ef99f6f9e459a32f2c2fd078a\``);
        await queryRunner.query(`ALTER TABLE \`PAGAMENTO_PEDIDO\` DROP FOREIGN KEY \`FK_e1a1fa819701e6f06816a8b78c9\``);
        await queryRunner.query(`ALTER TABLE \`PAGAMENTO\` DROP FOREIGN KEY \`FK_7e6ba2c9056373e4c762799eaa3\``);
        await queryRunner.query(`ALTER TABLE \`PAGAMENTO\` DROP FOREIGN KEY \`FK_0d0c575f48a4fe678173148156d\``);
        await queryRunner.query(`ALTER TABLE \`PAGAMENTO\` DROP FOREIGN KEY \`FK_503d948e41439503a637f146d75\``);
        await queryRunner.query(`ALTER TABLE \`NOTA_FISCAL\` DROP FOREIGN KEY \`FK_53587e2175429674989f61da160\``);
        await queryRunner.query(`ALTER TABLE \`CUPOM_DESCONTO\` DROP FOREIGN KEY \`FK_577007b2f099c57ac0a959d2345\``);
        await queryRunner.query(`ALTER TABLE \`ITEM_PEDIDO\` DROP FOREIGN KEY \`FK_dea4c4df3558a6bf4a799aa4773\``);
        await queryRunner.query(`ALTER TABLE \`ITEM_PEDIDO\` DROP FOREIGN KEY \`FK_d250e7a6b910ce68e7e6eeffc8a\``);
        await queryRunner.query(`ALTER TABLE \`PRODUTO\` DROP FOREIGN KEY \`FK_3a113ffe3a2042755e54120f957\``);
        await queryRunner.query(`ALTER TABLE \`PRODUTO\` DROP FOREIGN KEY \`FK_711a41c3de8cfee194fa18b00eb\``);
        await queryRunner.query(`ALTER TABLE \`ESTOQUE_ITEM\` DROP FOREIGN KEY \`FK_8c186d01380c5905737f56e8489\``);
        await queryRunner.query(`ALTER TABLE \`MOVIMENTACAO_ESTOQUE\` DROP FOREIGN KEY \`FK_57c345ee238785058affea4b5cd\``);
        await queryRunner.query(`ALTER TABLE \`MOVIMENTACAO_ESTOQUE\` DROP FOREIGN KEY \`FK_acfd44433e0e71247c2c0f83605\``);
        await queryRunner.query(`ALTER TABLE \`CATEGORIA\` DROP FOREIGN KEY \`FK_c28aee109023f1b56998424532f\``);
        await queryRunner.query(`ALTER TABLE \`COMANDA\` DROP FOREIGN KEY \`FK_6fd5f78c80915b4c9ef90a62f40\``);
        await queryRunner.query(`ALTER TABLE \`COMANDA\` DROP FOREIGN KEY \`FK_67b2e47de00a6df9bce7b47862d\``);
        await queryRunner.query(`ALTER TABLE \`CARGO\` DROP FOREIGN KEY \`FK_94256e68a5d0c2294defa3f7022\``);
        await queryRunner.query(`DROP TABLE \`ASSINATURA\``);
        await queryRunner.query(`DROP INDEX \`REL_28e1d2575f8a94cc6b4264c57b\` ON \`ESTABELECIMENTO\``);
        await queryRunner.query(`DROP TABLE \`ESTABELECIMENTO\``);
        await queryRunner.query(`DROP TABLE \`CONFIGURACAO_ESTABELECIMENTO\``);
        await queryRunner.query(`DROP INDEX \`IDX_77647cbaae451fa5007add2a3e\` ON \`USUARIO\``);
        await queryRunner.query(`DROP TABLE \`USUARIO\``);
        await queryRunner.query(`DROP TABLE \`PEDIDO\``);
        await queryRunner.query(`DROP TABLE \`PAGAMENTO_PEDIDO\``);
        await queryRunner.query(`DROP TABLE \`PAGAMENTO\``);
        await queryRunner.query(`DROP INDEX \`REL_53587e2175429674989f61da16\` ON \`NOTA_FISCAL\``);
        await queryRunner.query(`DROP TABLE \`NOTA_FISCAL\``);
        await queryRunner.query(`DROP INDEX \`IDX_308e5daa9c4dac8eea423a0257\` ON \`CUPOM_DESCONTO\``);
        await queryRunner.query(`DROP TABLE \`CUPOM_DESCONTO\``);
        await queryRunner.query(`DROP TABLE \`ITEM_PEDIDO\``);
        await queryRunner.query(`DROP TABLE \`PRODUTO\``);
        await queryRunner.query(`DROP TABLE \`ESTOQUE_ITEM\``);
        await queryRunner.query(`DROP TABLE \`MOVIMENTACAO_ESTOQUE\``);
        await queryRunner.query(`DROP TABLE \`CATEGORIA\``);
        await queryRunner.query(`DROP TABLE \`COMANDA\``);
        await queryRunner.query(`DROP TABLE \`CARGO\``);
        await queryRunner.query(`DROP TABLE \`PLANO\``);
    }

}
