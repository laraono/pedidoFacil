import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAdminRefreshToken1743033600000 implements MigrationInterface {
    name = 'AddAdminRefreshToken1743033600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`REFRESH_TOKEN\` ADD \`ID_Admin\` int NULL`)
        await queryRunner.query(`ALTER TABLE \`REFRESH_TOKEN\` MODIFY \`ID_Usuario\` int NULL`)
        await queryRunner.query(`ALTER TABLE \`REFRESH_TOKEN\` ADD CONSTRAINT \`FK_refresh_token_admin\` FOREIGN KEY (\`ID_Admin\`) REFERENCES \`ADMIN\`(\`ID_Admin\`) ON DELETE NO ACTION ON UPDATE NO ACTION`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`REFRESH_TOKEN\` DROP FOREIGN KEY \`FK_refresh_token_admin\``)
        await queryRunner.query(`ALTER TABLE \`REFRESH_TOKEN\` DROP COLUMN \`ID_Admin\``)
    }
}
