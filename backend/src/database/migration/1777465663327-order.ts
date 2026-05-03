import { MigrationInterface, QueryRunner } from "typeorm";

export class Order1777465663327 implements MigrationInterface {
    name = 'Order1777465663327'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`ASSINATURA\` ADD \`Valor_Assinatura\` decimal(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`CAIXA\` ADD \`ID_Terminal\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`PEDIDO\` ADD \`Valor_Total\` decimal(10,2) NOT NULL DEFAULT '0.00'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`PEDIDO\` DROP COLUMN \`Valor_Total\``);
        await queryRunner.query(`ALTER TABLE \`CAIXA\` DROP COLUMN \`ID_Terminal\``);
        await queryRunner.query(`ALTER TABLE \`ASSINATURA\` DROP COLUMN \`Valor_Assinatura\``);
    }

}
