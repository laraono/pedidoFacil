import { MigrationInterface, QueryRunner } from "typeorm";

export class DropCouponTipoDescontoNome1781620000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('CUPOM_DESCONTO');
        if (table?.findColumnByName('Tipo_Desconto')) {
            await queryRunner.dropColumn('CUPOM_DESCONTO', 'Tipo_Desconto');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE CUPOM_DESCONTO ADD COLUMN Tipo_Desconto VARCHAR(10) NOT NULL DEFAULT ''`
        );
    }

}
