import { MigrationInterface, QueryRunner } from "typeorm";

export class FirstMigration1773708090714 implements MigrationInterface {
    name = 'FirstMigration1773708090714'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`ItemPedidoVariacao\` (\`id-pedido\` int NOT NULL, \`id-produto-variacao\` int NOT NULL, \`observation\` varchar(255) NULL, \`quantity\` int NOT NULL, \`preco\` decimal(10,2) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id-pedido\`, \`id-produto-variacao\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Produto_Variacao\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(50) NOT NULL, \`preco_adicional\` decimal(10,2) NOT NULL, \`status\` varchar(30) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`productId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Categoria\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(50) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Produto\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(50) NOT NULL, \`description\` varchar(255) NOT NULL DEFAULT 1, \`is_available\` tinyint NOT NULL, \`preco_base\` decimal(10,2) NOT NULL, \`status\` varchar(30) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`categoryId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`ItemPedido\` (\`id-pedido\` int NOT NULL, \`id-produto\` int NOT NULL, \`observation\` varchar(255) NULL, \`quantity\` int NOT NULL, \`preco\` decimal(10,2) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id-pedido\`, \`id-produto\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Pedido\` (\`id\` int NOT NULL AUTO_INCREMENT, \`status\` varchar(30) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`comandaId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Comanda\` (\`id\` int NOT NULL AUTO_INCREMENT, \`label\` varchar(30) NOT NULL, \`status\` varchar(30) NOT NULL, \`total\` decimal(10,2) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`ItemPedidoVariacao\` ADD CONSTRAINT \`FK_986cb71dae7987134baa483f9e5\` FOREIGN KEY (\`id-produto-variacao\`) REFERENCES \`Produto_Variacao\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ItemPedidoVariacao\` ADD CONSTRAINT \`FK_099fc02cb853902f98b8747d2b2\` FOREIGN KEY (\`id-pedido\`) REFERENCES \`Pedido\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Produto_Variacao\` ADD CONSTRAINT \`FK_aac7716248ef4e09ec0e6056ff4\` FOREIGN KEY (\`productId\`) REFERENCES \`Produto\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Produto\` ADD CONSTRAINT \`FK_58f16dee32c84a5263924951e47\` FOREIGN KEY (\`categoryId\`) REFERENCES \`Categoria\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ItemPedido\` ADD CONSTRAINT \`FK_20aab5e7a2475fa9c873255e8d1\` FOREIGN KEY (\`id-produto\`) REFERENCES \`Produto\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ItemPedido\` ADD CONSTRAINT \`FK_e12edd337afce85288f28a4d3d1\` FOREIGN KEY (\`id-pedido\`) REFERENCES \`Pedido\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Pedido\` ADD CONSTRAINT \`FK_ae04aeb742c160c372df59a3d6c\` FOREIGN KEY (\`comandaId\`) REFERENCES \`Comanda\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Pedido\` DROP FOREIGN KEY \`FK_ae04aeb742c160c372df59a3d6c\``);
        await queryRunner.query(`ALTER TABLE \`ItemPedido\` DROP FOREIGN KEY \`FK_e12edd337afce85288f28a4d3d1\``);
        await queryRunner.query(`ALTER TABLE \`ItemPedido\` DROP FOREIGN KEY \`FK_20aab5e7a2475fa9c873255e8d1\``);
        await queryRunner.query(`ALTER TABLE \`Produto\` DROP FOREIGN KEY \`FK_58f16dee32c84a5263924951e47\``);
        await queryRunner.query(`ALTER TABLE \`Produto_Variacao\` DROP FOREIGN KEY \`FK_aac7716248ef4e09ec0e6056ff4\``);
        await queryRunner.query(`ALTER TABLE \`ItemPedidoVariacao\` DROP FOREIGN KEY \`FK_099fc02cb853902f98b8747d2b2\``);
        await queryRunner.query(`ALTER TABLE \`ItemPedidoVariacao\` DROP FOREIGN KEY \`FK_986cb71dae7987134baa483f9e5\``);
        await queryRunner.query(`DROP TABLE \`Comanda\``);
        await queryRunner.query(`DROP TABLE \`Pedido\``);
        await queryRunner.query(`DROP TABLE \`ItemPedido\``);
        await queryRunner.query(`DROP TABLE \`Produto\``);
        await queryRunner.query(`DROP TABLE \`Categoria\``);
        await queryRunner.query(`DROP TABLE \`Produto_Variacao\``);
        await queryRunner.query(`DROP TABLE \`ItemPedidoVariacao\``);
    }

}
