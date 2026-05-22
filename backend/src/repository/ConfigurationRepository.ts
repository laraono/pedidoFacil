import { DataSource, Repository, DeepPartial } from "typeorm";
import { Configuration } from "../database/entity/Configuration";

export class ConfigurationRepository {
    private repo: Repository<Configuration>;

    constructor(dataSource: DataSource) {
        this.repo = dataSource.getRepository(Configuration);
    }

    create(data: Partial<Configuration>): Configuration {
        return this.repo.create(data as DeepPartial<Configuration>);
    }

    async save(config: Configuration): Promise<Configuration> {
        return await this.repo.save(config);
    }

    async findByEstablishmentId(establishmentId: number): Promise<Configuration | null> {
        return await this.repo.findOne({ where: { establishment: { id: establishmentId } } });
    }

    merge(target: Configuration, data: Partial<Configuration>): Configuration {
        return this.repo.merge(target, data as DeepPartial<Configuration>);
    }
}