import { DataSource, Repository, DeepPartial } from "typeorm";
import { Establishment } from "../database/entity/Establishment";

export class EstablishmentRepository extends Repository<Establishment> {

    constructor(dataSource: DataSource) {
        super(Establishment, dataSource.createEntityManager());
    }

    async findByManagerId(userId: number): Promise<Establishment | null> {
        return await this.findOne({ where: { manager: { id: userId } } });
    }

    async findByCnpj(cnpj: string): Promise<Establishment | null> {
        return await this.findOne({ where: { cnpj } });
    }

    async getByIdWithRelations(id: number): Promise<Establishment | null> {
        return await this.findOne({
            where: { id },
            relations: ['manager', 'configurations']
        });
    }
}