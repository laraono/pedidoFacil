import { DataSource, Repository } from "typeorm";
import { Establishment } from "../database";

export class EstablishmentRepository extends Repository<Establishment> {

    constructor(private dataSource: DataSource) {
        super(Establishment, dataSource.createEntityManager());
    }

    async getEstablishment(establishmetnId: number) {
        return await this.findOne({
            where: {
                id: establishmetnId
            }
        })
    }

}