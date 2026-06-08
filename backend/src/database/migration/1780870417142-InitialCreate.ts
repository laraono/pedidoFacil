import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialCreate1780870417142 implements MigrationInterface {
    name = 'InitialCreate1780870417142'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`PAGAMENTO\` DROP FOREIGN KEY \`FK_503d948e41439503a637f146d75\``);
        await queryRunner.query(`DROP INDEX \`REL_503d948e41439503a637f146d7\` ON \`PAGAMENTO\``);
        await queryRunner.query(`CREATE TABLE \`HISTORICO_PAGAMENTO_ASSINATURA\` (\`ID_Historico\` int NOT NULL AUTO_INCREMENT, \`ID_MP_Pagamento\` varchar(255) NOT NULL, \`Valor\` decimal(10,2) NOT NULL, \`Status\` enum ('Aprovado', 'Rejeitado') NOT NULL, \`Tipo_Pagamento\` varchar(50) NULL, \`Nome_Plano\` varchar(255) NOT NULL, \`Data_Pagamento\` datetime NULL, \`Data_Criacao\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`ID_Assinatura\` int NULL, UNIQUE INDEX \`IDX_4dbbb5ab8056e7f1108e5c0270\` (\`ID_MP_Pagamento\`), PRIMARY KEY (\`ID_Historico\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`PAGAMENTO\` DROP COLUMN \`ID_Cupom_Aplicado\``);
        await queryRunner.query(`ALTER TABLE \`ASSINATURA\` DROP COLUMN \`Ultimo_ID_Pagamento\``);
        await queryRunner.query(`ALTER TABLE \`NOTA_FISCAL\` CHANGE \`Status\` \`Status\` enum ('Autorizada', 'Cancelada', 'Erro') NOT NULL DEFAULT 'Autorizada'`);
        await queryRunner.query(`CREATE INDEX \`idx_pagamento_est_status_data\` ON \`PAGAMENTO\` (\`ID_Estabelecimento\`, \`Status\`, \`Data_Hora_Pagamento\`)`);
        await queryRunner.query(`CREATE INDEX \`idx_comanda_est_status_data\` ON \`COMANDA\` (\`ID_Estabelecimento\`, \`Status\`, \`Data_Abertura\`)`);
        await queryRunner.query(`CREATE INDEX \`idx_pedido_comanda_status_data\` ON \`PEDIDO\` (\`ID_Comanda\`, \`Status\`, \`Data_Hora_Chegada\`)`);
        await queryRunner.query(`ALTER TABLE \`HISTORICO_PAGAMENTO_ASSINATURA\` ADD CONSTRAINT \`FK_0a6703d726a5ec9cad532bfd9a4\` FOREIGN KEY (\`ID_Assinatura\`) REFERENCES \`ASSINATURA\`(\`ID_Assinatura\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`HISTORICO_PAGAMENTO_ASSINATURA\` DROP FOREIGN KEY \`FK_0a6703d726a5ec9cad532bfd9a4\``);
        await queryRunner.query(`DROP INDEX \`idx_pedido_comanda_status_data\` ON \`PEDIDO\``);
        await queryRunner.query(`DROP INDEX \`idx_comanda_est_status_data\` ON \`COMANDA\``);
        await queryRunner.query(`DROP INDEX \`idx_pagamento_est_status_data\` ON \`PAGAMENTO\``);
        await queryRunner.query(`ALTER TABLE \`NOTA_FISCAL\` CHANGE \`Status\` \`Status\` enum ('autorizada', 'erro', 'cancelada', 'pendente') NOT NULL DEFAULT 'autorizada'`);
        await queryRunner.query(`ALTER TABLE \`ASSINATURA\` ADD \`Ultimo_ID_Pagamento\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`PAGAMENTO\` ADD \`ID_Cupom_Aplicado\` int NULL`);
        await queryRunner.query(`DROP INDEX \`IDX_4dbbb5ab8056e7f1108e5c0270\` ON \`HISTORICO_PAGAMENTO_ASSINATURA\``);
        await queryRunner.query(`DROP TABLE \`HISTORICO_PAGAMENTO_ASSINATURA\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_503d948e41439503a637f146d7\` ON \`PAGAMENTO\` (\`ID_Cupom_Aplicado\`)`);
        await queryRunner.query(`ALTER TABLE \`PAGAMENTO\` ADD CONSTRAINT \`FK_503d948e41439503a637f146d75\` FOREIGN KEY (\`ID_Cupom_Aplicado\`) REFERENCES \`CUPOM_DESCONTO\`(\`ID_Cupom\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
