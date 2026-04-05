import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImageToCategory1775346240734 implements MigrationInterface {
    name = 'AddImageToCategory1775346240734'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`PRODUTO\` DROP COLUMN \`Disponivel\``);
        await queryRunner.query(`ALTER TABLE \`CATEGORIA\` ADD \`Imagem\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`CATEGORIA\` DROP COLUMN \`Imagem\``);
        await queryRunner.query(`ALTER TABLE \`PRODUTO\` ADD \`Disponivel\` tinyint NOT NULL`);
    }

}
