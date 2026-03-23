import { DataSource, Repository } from "typeorm";
import { Comanda } from "../database";
import { CancelComandaParams, CreateComanda } from "../dto";
import { ComandaStatus } from "../enum";

export class ComandaRepository extends Repository<Comanda>{

    constructor(private dataSource: DataSource) {
        super(Comanda, dataSource.createEntityManager());
    }

    async createComanda(comanda: CreateComanda) {
        return await this.save(comanda)
    }

    async listComandas() {
        return await this.find()
    }

    async listComandasByStatus(status: ComandaStatus) {
        return await this.find({
            where: {
                status
            }
        })
    }

    async getComandaByDesc(description: string) {
        return await this.find({
            where: {
                status: ComandaStatus.ABERTA,
                description
            }
        })
    }

    async getComanda(comandaId: number) {
        return await this.findOne({
            where: {
                id: comandaId
            }
        })
    }

    async updateComandaTotal(comandaId: number, total: number) {
        await this.update(comandaId, {total})
    }

    async updateComandaStatus(comandaId: number, status: ComandaStatus) {
        await this.update(comandaId, {status})
    }

    async cancelComanda(comandaId: number, params: CancelComandaParams) {
        await this.update(comandaId, params)
    }
    
}