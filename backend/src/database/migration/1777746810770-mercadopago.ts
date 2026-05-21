import { MigrationInterface, QueryRunner } from "typeorm";

export class Mercadopago1777746810770 implements MigrationInterface {
    name = 'Mercadopago1777746810770'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`ITEM_PEDIDO\` CHANGE \`created_at\` \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`ITEM_PEDIDO_VARIACAO\` CHANGE \`created_at\` \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`PAGAMENTO\` DROP COLUMN \`deleted_at\``);
        await queryRunner.query(`ALTER TABLE \`PEDIDO\` DROP COLUMN \`Observacoes_Geral\``);
        await queryRunner.query(`ALTER TABLE \`PEDIDO\` DROP COLUMN \`Valor_Total\``);
        await queryRunner.query(`ALTER TABLE \`PRODUTO_VARIACAO\` DROP COLUMN \`deleted_at\``);
        await queryRunner.query(`ALTER TABLE \`PRODUTO_VARIACAO\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`PRODUTO\` DROP COLUMN \`Data_Criacao\``);
        await queryRunner.query(`ALTER TABLE \`USUARIO\` ADD \`Mercado_Pago_Id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`ASSINATURA\` ADD \`Valor_Assinatura\` decimal(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`CAIXA\` ADD \`ID_Terminal\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`CAIXA\` DROP COLUMN \`ID_Terminal\``);
        await queryRunner.query(`ALTER TABLE \`ASSINATURA\` DROP COLUMN \`Valor_Assinatura\``);
        await queryRunner.query(`ALTER TABLE \`USUARIO\` DROP COLUMN \`Mercado_Pago_Id\``);
        await queryRunner.query(`ALTER TABLE \`PRODUTO\` ADD \`Data_Criacao\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`PRODUTO_VARIACAO\` ADD \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`PRODUTO_VARIACAO\` ADD \`deleted_at\` datetime(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`PEDIDO\` ADD \`Valor_Total\` decimal NULL`);
        await queryRunner.query(`ALTER TABLE \`PEDIDO\` ADD \`Observacoes_Geral\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`PAGAMENTO\` ADD \`deleted_at\` datetime(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`ITEM_PEDIDO_VARIACAO\` CHANGE \`createdAt\` \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`ITEM_PEDIDO\` CHANGE \`createdAt\` \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
    }

}
