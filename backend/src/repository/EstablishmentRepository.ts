import { DataSource, Repository, DeepPartial } from "typeorm";
import { Establishment } from "../database/entity/Establishment";

export class EstablishmentRepository {
    private repo: Repository<Establishment>;

    constructor(dataSource: DataSource) {
        this.repo = dataSource.getRepository(Establishment);
    }

    create(data: Partial<Establishment>): Establishment {
        return this.repo.create(data as DeepPartial<Establishment>);
    }

    async save(establishment: Establishment): Promise<Establishment> {
        return await this.repo.save(establishment);
    }

    async findByManagerId(userId: number): Promise<Establishment | null> {
        return await this.repo.findOne({ where: { manager: { id: userId } } });
    }

    async findByCnpj(cnpj: string): Promise<Establishment | null> {
        return await this.repo.findOne({ where: { cnpj } });
    }

    async getByIdWithRelations(id: number): Promise<Establishment | null> {
        return await this.repo.findOne({
            where: { id },
            relations: ['manager', 'configurations']
        });
    }

    async softRemove(establishment: Establishment): Promise<void> {
        await this.repo.softRemove(establishment);
    }

    merge(target: Establishment, data: Partial<Establishment>): Establishment {
        return this.repo.merge(target, data as DeepPartial<Establishment>);
    }
}