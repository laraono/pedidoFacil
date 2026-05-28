import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialCreate1779669251490 implements MigrationInterface {
    name = 'InitialCreate1779669251490'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`MOVIMENTACAO_ESTOQUE\` (\`ID_Movimentacao\` int NOT NULL AUTO_INCREMENT, \`Justificativa\` varchar(255) NULL, \`Quantidade\` int NOT NULL, \`Tipo_Movimentacao\` varchar(255) NOT NULL, \`ID_Estoque_Item\` int NULL, \`ID_Usuario_Responsavel\` int NULL, PRIMARY KEY (\`ID_Movimentacao\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`NOTA_FISCAL\` (\`ID_Nota\` int NOT NULL AUTO_INCREMENT, \`Numero_Nota\` varchar(50) NOT NULL, \`CPF_CNPJ_Cliente\` varchar(18) NULL, \`Status\` enum ('autorizada', 'erro', 'cancelada', 'pendente') NOT NULL DEFAULT 'autorizada', \`Valor_Total\` decimal(10,2) NOT NULL, \`Data_Emissao\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`Data_Exclusao\` datetime(6) NULL, \`ID_Estabelecimento\` int NULL, \`ID_Pagamento\` int NULL, UNIQUE INDEX \`REL_53587e2175429674989f61da16\` (\`ID_Pagamento\`), PRIMARY KEY (\`ID_Nota\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`USUARIO\` ADD \`Password_Reset_Token\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`USUARIO\` ADD \`Password_Reset_Expires\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`MOVIMENTACAO_ESTOQUE\` ADD CONSTRAINT \`FK_acfd44433e0e71247c2c0f83605\` FOREIGN KEY (\`ID_Estoque_Item\`) REFERENCES \`ESTOQUE_ITEM\`(\`ID_Estoque_Item\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`MOVIMENTACAO_ESTOQUE\` ADD CONSTRAINT \`FK_57c345ee238785058affea4b5cd\` FOREIGN KEY (\`ID_Usuario_Responsavel\`) REFERENCES \`USUARIO\`(\`ID_Usuario\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`NOTA_FISCAL\` ADD CONSTRAINT \`FK_de876b1390cccda1e12da86d522\` FOREIGN KEY (\`ID_Estabelecimento\`) REFERENCES \`ESTABELECIMENTO\`(\`ID_Estabelecimento\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`NOTA_FISCAL\` ADD CONSTRAINT \`FK_53587e2175429674989f61da160\` FOREIGN KEY (\`ID_Pagamento\`) REFERENCES \`PAGAMENTO\`(\`ID_Pagamento\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`NOTA_FISCAL\` DROP FOREIGN KEY \`FK_53587e2175429674989f61da160\``);
        await queryRunner.query(`ALTER TABLE \`NOTA_FISCAL\` DROP FOREIGN KEY \`FK_de876b1390cccda1e12da86d522\``);
        await queryRunner.query(`ALTER TABLE \`MOVIMENTACAO_ESTOQUE\` DROP FOREIGN KEY \`FK_57c345ee238785058affea4b5cd\``);
        await queryRunner.query(`ALTER TABLE \`MOVIMENTACAO_ESTOQUE\` DROP FOREIGN KEY \`FK_acfd44433e0e71247c2c0f83605\``);
        await queryRunner.query(`ALTER TABLE \`USUARIO\` DROP COLUMN \`Password_Reset_Expires\``);
        await queryRunner.query(`ALTER TABLE \`USUARIO\` DROP COLUMN \`Password_Reset_Token\``);
        await queryRunner.query(`DROP INDEX \`REL_53587e2175429674989f61da16\` ON \`NOTA_FISCAL\``);
        await queryRunner.query(`DROP TABLE \`NOTA_FISCAL\``);
        await queryRunner.query(`DROP TABLE \`MOVIMENTACAO_ESTOQUE\``);
    }

}
