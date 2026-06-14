import { DataSource, Repository } from "typeorm";
import { Comanda } from "../database/entity/Comanda";
import { CreateComanda } from "../dto";
import { ComandaStatus } from "../enum";
import { STATUS_COMANDA_IDS } from "../database/entity/lookup-ids";

export class ComandaRepository extends Repository<Comanda>{

    constructor(private dataSource: DataSource) {
        super(Comanda, dataSource.createEntityManager());
    }

    async createComanda(comanda: CreateComanda) {
        return await this.save(comanda as any)
    }

    async listComandas(establishmentId: number) {
        return await this.find({
            where: { establishment: { id: establishmentId } }
        })
    }

    async listComandasByStatus(status: ComandaStatus, establishmentId: number) {
        return await this.find({
            where: {
                status: { nome: status },
                establishment: { id: establishmentId }
            },
            relations: ['pedidos', 'pedidos.productOrders', 'pedidos.productOrders.product']
        });
    }

    async getComandaByDesc(description: string, establishmentId: number) {
        return await this.find({
            where: {
                status: { nome: ComandaStatus.ABERTA },
                description,
                establishment: { id: establishmentId }
            }
        })
    }

    async getComanda(comandaId: number, establishmentId: number) {
        return await this.findOne({
            where: {
                id: comandaId,
                establishment: { id: establishmentId }
            }
        })
    }

    async updateComandaTotal(comandaId: number, total: number) {
        await this.update(comandaId, { total })
    }

    async updateComandaStatus(comandaId: number, status: ComandaStatus) {
        const statusIdMap: Record<ComandaStatus, number> = {
            [ComandaStatus.ABERTA]: STATUS_COMANDA_IDS.ABERTA,
            [ComandaStatus.FECHADA]: STATUS_COMANDA_IDS.FECHADA,
            [ComandaStatus.CANCELADA]: STATUS_COMANDA_IDS.CANCELADA,
        };
        await this.update(comandaId, { status: { id: statusIdMap[status] } as any })
    }

    async cancelComanda(comandaId: number) {
        await this.update(comandaId, { status: { id: STATUS_COMANDA_IDS.CANCELADA } as any })
    }
}
