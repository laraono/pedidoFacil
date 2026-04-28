import { MigrationInterface, QueryRunner } from "typeorm";

export class Feture1776983218438 implements MigrationInterface {
    name = 'Feture1776983218438'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`PLANO\` ADD \`Features\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`PLANO\` DROP COLUMN \`Features\``);
    }

}
