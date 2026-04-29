import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNuvemFiscalColumns1773900000000 implements MigrationInterface {
    name = 'AddNuvemFiscalColumns1773900000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`NOTA_FISCAL\`
            ADD COLUMN \`Codigo_Retorno\` VARCHAR(10) NULL,
            ADD COLUMN \`Mensagem_Retorno\` TEXT NULL,
            ADD COLUMN \`URL_DANFE\` VARCHAR(500) NULL,
            ADD COLUMN \`ID_NF_Provider\` VARCHAR(100) NULL
        `);

        await queryRunner.query(`
            ALTER TABLE \`NOTA_FISCAL\`
            MODIFY COLUMN \`Numero_Nota\` VARCHAR(50) NULL
        `);

        await queryRunner.query(`
            ALTER TABLE \`NOTA_FISCAL\`
            MODIFY COLUMN \`Status\` ENUM('autorizada','erro','cancelada','pendente')
            NOT NULL DEFAULT 'pendente'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`NOTA_FISCAL\`
            DROP COLUMN \`Codigo_Retorno\`,
            DROP COLUMN \`Mensagem_Retorno\`,
            DROP COLUMN \`URL_DANFE\`,
            DROP COLUMN \`ID_NF_Provider\`
        `);

        await queryRunner.query(`
            ALTER TABLE \`NOTA_FISCAL\`
            MODIFY COLUMN \`Numero_Nota\` VARCHAR(50) NOT NULL
        `);

        await queryRunner.query(`
            ALTER TABLE \`NOTA_FISCAL\`
            MODIFY COLUMN \`Status\` ENUM('autorizada','erro','cancelada','pendente')
            NOT NULL DEFAULT 'autorizada'
        `);
    }
}
