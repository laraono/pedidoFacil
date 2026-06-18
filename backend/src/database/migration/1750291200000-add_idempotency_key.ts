import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIdempotencyKey1750291200000 implements MigrationInterface {
    name = 'AddIdempotencyKey1750291200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`PEDIDO\` ADD \`Idempotency_Key\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`PEDIDO\` ADD UNIQUE INDEX \`IDX_pedido_idempotency_key\` (\`Idempotency_Key\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`PEDIDO\` DROP INDEX \`IDX_pedido_idempotency_key\``);
        await queryRunner.query(`ALTER TABLE \`PEDIDO\` DROP COLUMN \`Idempotency_Key\``);
    }
}