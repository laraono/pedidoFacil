import { MigrationInterface, QueryRunner } from "typeorm";

export class FixPaymentMethodEncoding1781600000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE \`METODO_PAGAMENTO\` SET \`Nome\` = 'Crédito'        WHERE \`Nome\` = 'CrÃ©dito'`);
        await queryRunner.query(`UPDATE \`METODO_PAGAMENTO\` SET \`Nome\` = 'Débito'         WHERE \`Nome\` = 'DÃ©bito'`);
        await queryRunner.query(`UPDATE \`METODO_PAGAMENTO\` SET \`Nome\` = 'Vale Refeição'  WHERE \`Nome\` = 'Vale RefeiÃ§Ã£o'`);
        await queryRunner.query(`UPDATE \`METODO_PAGAMENTO\` SET \`Nome\` = 'Vale Alimentação' WHERE \`Nome\` = 'Vale AlimentaÃ§Ã£o'`);

        await queryRunner.query(`
            INSERT IGNORE INTO \`METODO_PAGAMENTO\` (\`Nome\`) VALUES
                ('Dinheiro'), ('Crédito'), ('Débito'), ('Pix'), ('Vale Refeição'), ('Vale Alimentação')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE \`METODO_PAGAMENTO\` SET \`Nome\` = 'CrÃ©dito'        WHERE \`Nome\` = 'Crédito'`);
        await queryRunner.query(`UPDATE \`METODO_PAGAMENTO\` SET \`Nome\` = 'DÃ©bito'         WHERE \`Nome\` = 'Débito'`);
        await queryRunner.query(`UPDATE \`METODO_PAGAMENTO\` SET \`Nome\` = 'Vale RefeiÃ§Ã£o'  WHERE \`Nome\` = 'Vale Refeição'`);
        await queryRunner.query(`UPDATE \`METODO_PAGAMENTO\` SET \`Nome\` = 'Vale AlimentaÃ§Ã£o' WHERE \`Nome\` = 'Vale Alimentação'`);
    }
}
