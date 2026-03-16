import { MigrationInterface, QueryRunner } from "typeorm";

export class PrimaryMigration1773686574239 implements MigrationInterface {
    name = 'PrimaryMigration1773686574239'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`Addon\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, \`price\` decimal(10,2) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`productId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Categoria\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(50) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Produto\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(50) NOT NULL, \`description\` varchar(255) NOT NULL DEFAULT 1, \`is_available\` tinyint NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`categoryId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Tamanho\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(50) NOT NULL, \`price\` decimal(10,2) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`productId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`ProdutoPedido\` (\`id-produto\` int NOT NULL, \`id-pedido\` int NOT NULL, \`id-tamanho\` int NOT NULL, \`observation\` varchar(255) NULL, \`quantity\` int NOT NULL, \`price\` decimal(10,2) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`addonId\` int NULL, PRIMARY KEY (\`id-produto\`, \`id-pedido\`, \`id-tamanho\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Pedido\` (\`id\` int NOT NULL AUTO_INCREMENT, \`status\` varchar(30) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`comandaId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Comanda\` (\`id\` int NOT NULL AUTO_INCREMENT, \`label\` varchar(30) NOT NULL, \`status\` varchar(30) NOT NULL, \`total\` decimal(10,2) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`Addon\` ADD CONSTRAINT \`FK_80a2bc4036358009bc03cbd6307\` FOREIGN KEY (\`productId\`) REFERENCES \`Produto\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Produto\` ADD CONSTRAINT \`FK_58f16dee32c84a5263924951e47\` FOREIGN KEY (\`categoryId\`) REFERENCES \`Categoria\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Tamanho\` ADD CONSTRAINT \`FK_242c16f07b9170b3b55bb9a8886\` FOREIGN KEY (\`productId\`) REFERENCES \`Produto\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ProdutoPedido\` ADD CONSTRAINT \`FK_7d788f8457c8458ae911019a6c1\` FOREIGN KEY (\`id-tamanho\`) REFERENCES \`Tamanho\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ProdutoPedido\` ADD CONSTRAINT \`FK_6776db7759f5975017fa865f290\` FOREIGN KEY (\`addonId\`) REFERENCES \`Addon\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ProdutoPedido\` ADD CONSTRAINT \`FK_fda724cf5142b93404579c3d501\` FOREIGN KEY (\`id-produto\`) REFERENCES \`Produto\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ProdutoPedido\` ADD CONSTRAINT \`FK_ff5a5d7f8dd9d25e3d5cd662e00\` FOREIGN KEY (\`id-pedido\`) REFERENCES \`Pedido\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Pedido\` ADD CONSTRAINT \`FK_ae04aeb742c160c372df59a3d6c\` FOREIGN KEY (\`comandaId\`) REFERENCES \`Comanda\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Pedido\` DROP FOREIGN KEY \`FK_ae04aeb742c160c372df59a3d6c\``);
        await queryRunner.query(`ALTER TABLE \`ProdutoPedido\` DROP FOREIGN KEY \`FK_ff5a5d7f8dd9d25e3d5cd662e00\``);
        await queryRunner.query(`ALTER TABLE \`ProdutoPedido\` DROP FOREIGN KEY \`FK_fda724cf5142b93404579c3d501\``);
        await queryRunner.query(`ALTER TABLE \`ProdutoPedido\` DROP FOREIGN KEY \`FK_6776db7759f5975017fa865f290\``);
        await queryRunner.query(`ALTER TABLE \`ProdutoPedido\` DROP FOREIGN KEY \`FK_7d788f8457c8458ae911019a6c1\``);
        await queryRunner.query(`ALTER TABLE \`Tamanho\` DROP FOREIGN KEY \`FK_242c16f07b9170b3b55bb9a8886\``);
        await queryRunner.query(`ALTER TABLE \`Produto\` DROP FOREIGN KEY \`FK_58f16dee32c84a5263924951e47\``);
        await queryRunner.query(`ALTER TABLE \`Addon\` DROP FOREIGN KEY \`FK_80a2bc4036358009bc03cbd6307\``);
        await queryRunner.query(`DROP TABLE \`Comanda\``);
        await queryRunner.query(`DROP TABLE \`Pedido\``);
        await queryRunner.query(`DROP TABLE \`ProdutoPedido\``);
        await queryRunner.query(`DROP TABLE \`Tamanho\``);
        await queryRunner.query(`DROP TABLE \`Produto\``);
        await queryRunner.query(`DROP TABLE \`Categoria\``);
        await queryRunner.query(`DROP TABLE \`Addon\``);
    }

}
