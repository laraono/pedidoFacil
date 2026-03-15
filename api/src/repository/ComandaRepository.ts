import { DataSource, Repository } from "typeorm";
import { Comanda } from "../database";

export class ComandaRepository extends Repository<Comanda>{

    constructor(private dataSource: DataSource) {
        super(Comanda, dataSource.createEntityManager());
    }

    async createComanda(comanda: Comanda) {
        return await this.save(comanda)
    }

    async listComandas() {
        return await this.find()
    }

    async getComanda(comandaId: number) {
        return await this.findOne({
            where: {
                id: comandaId
            }
        })
    }
    
}