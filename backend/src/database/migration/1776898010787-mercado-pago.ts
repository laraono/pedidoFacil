import { MigrationInterface, QueryRunner } from "typeorm";

export class MercadoPago1776898010787 implements MigrationInterface {
    name = 'MercadoPago1776898010787'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_53587e2175429674989f61da16\` ON \`NOTA_FISCAL\``);
        await queryRunner.query(`CREATE TABLE \`CAIXA\` (\`ID_Assinatura\` int NOT NULL AUTO_INCREMENT, \`Nome\` varchar(255) NOT NULL, \`Mercado_Pago_Id\` varchar(255) NOT NULL, \`Data_Hora_Criacao\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`Data_Hora_Delecao\` datetime(6) NULL, \`ID_Estabelecimento\` int NULL, PRIMARY KEY (\`ID_Assinatura\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`PAGAMENTO\` ADD \`Mercado_Pago_Order_Id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`PAGAMENTO\` ADD \`Mercado_Pago_Payment_Id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`ASSINATURA\` ADD \`Data_Hora_Criacao\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`ASSINATURA\` ADD \`Data_Hora_Delecao\` datetime(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`ESTABELECIMENTO\` ADD \`Mercado_Pago_Id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`CAIXA\` ADD CONSTRAINT \`FK_14bdd214a3cb4aa00dc17c75869\` FOREIGN KEY (\`ID_Estabelecimento\`) REFERENCES \`ESTABELECIMENTO\`(\`ID_Estabelecimento\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`CAIXA\` DROP FOREIGN KEY \`FK_14bdd214a3cb4aa00dc17c75869\``);
        await queryRunner.query(`ALTER TABLE \`ESTABELECIMENTO\` DROP COLUMN \`Mercado_Pago_Id\``);
        await queryRunner.query(`ALTER TABLE \`ASSINATURA\` DROP COLUMN \`Data_Hora_Delecao\``);
        await queryRunner.query(`ALTER TABLE \`ASSINATURA\` DROP COLUMN \`Data_Hora_Criacao\``);
        await queryRunner.query(`ALTER TABLE \`PAGAMENTO\` DROP COLUMN \`Mercado_Pago_Payment_Id\``);
        await queryRunner.query(`ALTER TABLE \`PAGAMENTO\` DROP COLUMN \`Mercado_Pago_Order_Id\``);
        await queryRunner.query(`DROP TABLE \`CAIXA\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_53587e2175429674989f61da16\` ON \`NOTA_FISCAL\` (\`ID_Pagamento\`)`);
    }

}
