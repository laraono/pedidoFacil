import { DataSource, Repository } from "typeorm";
import { Comanda } from "../database";
import { CancelComandaParams, CreateComandaParams } from "../dto";
import { ComandaStatus } from "../enum";

export class ComandaRepository extends Repository<Comanda>{

    constructor(private dataSource: DataSource) {
        super(Comanda, dataSource.createEntityManager());
    }

    async createComanda(comanda: CreateComandaParams) {
        return await this.save(comanda)
    }

    async listComandas(establishmentId: number) {
        return await this.find({
            where: {
                establishment: {
                    id: establishmentId
                }
            }
        })
    }

    async listComandasByStatus(status: ComandaStatus, establishmentId: number) {
        return await this.find({
            where: {
                status,
                establishment: {
                    id: establishmentId
                }
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