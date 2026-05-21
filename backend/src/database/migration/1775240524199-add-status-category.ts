import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatusCategory1775240524199 implements MigrationInterface {
    name = 'AddStatusCategory1775240524199'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`CATEGORIA\` ADD \`Status\` varchar(30) NOT NULL DEFAULT 'Ativa'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`CATEGORIA\` DROP COLUMN \`Status\``);
    }

}
