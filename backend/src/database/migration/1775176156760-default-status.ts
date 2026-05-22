import { MigrationInterface, QueryRunner } from "typeorm";

export class DefaultStatus1775176156760 implements MigrationInterface {
    name = 'DefaultStatus1775176156760'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`PAGAMENTO\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`CUPOM_DESCONTO\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`ASSINATURA\` CHANGE \`Status\` \`Status\` varchar(255) NOT NULL DEFAULT 'Pendente'`);
        await queryRunner.query(`ALTER TABLE \`PEDIDO\` CHANGE \`Status\` \`Status\` varchar(30) NOT NULL DEFAULT 'Aguardando_Preparo'`);
        await queryRunner.query(`ALTER TABLE \`PRODUTO_VARIACAO\` CHANGE \`status\` \`status\` varchar(30) NOT NULL DEFAULT 'Ativo'`);
        await queryRunner.query(`ALTER TABLE \`PRODUTO\` CHANGE \`Status\` \`Status\` varchar(30) NOT NULL DEFAULT 'Ativo'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`PRODUTO\` CHANGE \`Status\` \`Status\` varchar(30) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`PRODUTO_VARIACAO\` CHANGE \`status\` \`status\` varchar(30) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`PEDIDO\` CHANGE \`Status\` \`Status\` varchar(30) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`ASSINATURA\` CHANGE \`Status\` \`Status\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`CUPOM_DESCONTO\` ADD \`status\` varchar(30) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`PAGAMENTO\` ADD \`status\` varchar(30) NOT NULL`);
    }

}
