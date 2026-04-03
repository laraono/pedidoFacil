import { MigrationInterface, QueryRunner } from "typeorm";

export class Mar1775005652613 implements MigrationInterface {
    name = '31Mar1775005652613'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`PEDIDO\` CHANGE \`Tipo_Atendimento\` \`Tipo_Atendimento\` varchar(30) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`PEDIDO\` CHANGE \`Tipo_Atendimento\` \`Tipo_Atendimento\` varchar(30) NOT NULL`);
    }

}
