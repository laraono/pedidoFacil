import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialCreate1780783599222 implements MigrationInterface {
    name = 'InitialCreate1780783599222'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`USUARIO\` DROP FOREIGN KEY \`FK_68069b6cef21c635907f6ce7991\``);
        await queryRunner.query(`DROP INDEX \`IDX_4123aaa602820747847ae86726\` ON \`USUARIO\``);
        await queryRunner.query(`ALTER TABLE \`USUARIO\` CHANGE \`ID_Estabelecimento\` \`Data_Exclusao\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`USUARIO\` DROP COLUMN \`Data_Exclusao\``);
        await queryRunner.query(`ALTER TABLE \`USUARIO\` ADD \`Data_Exclusao\` datetime(6) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`USUARIO\` DROP COLUMN \`Data_Exclusao\``);
        await queryRunner.query(`ALTER TABLE \`USUARIO\` ADD \`Data_Exclusao\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`USUARIO\` CHANGE \`Data_Exclusao\` \`ID_Estabelecimento\` int NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_4123aaa602820747847ae86726\` ON \`USUARIO\` (\`CPF\`)`);
        await queryRunner.query(`ALTER TABLE \`USUARIO\` ADD CONSTRAINT \`FK_68069b6cef21c635907f6ce7991\` FOREIGN KEY (\`ID_Estabelecimento\`) REFERENCES \`ESTABELECIMENTO\`(\`ID_Estabelecimento\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
