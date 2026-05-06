import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmpresaNuvemFiscal1778000000000 implements MigrationInterface {
    name = 'AddEmpresaNuvemFiscal1778000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`ESTABELECIMENTO\`
            ADD COLUMN \`Razao_Social\` VARCHAR(150) NULL,
            ADD COLUMN \`Inscricao_Municipal_Path\` TEXT NULL,
            ADD COLUMN \`Nuvem_Fiscal_Empresa_Id\` VARCHAR(100) NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`ESTABELECIMENTO\`
            DROP COLUMN \`Razao_Social\`,
            DROP COLUMN \`Inscricao_Municipal_Path\`,
            DROP COLUMN \`Nuvem_Fiscal_Empresa_Id\`
        `);
    }
}
