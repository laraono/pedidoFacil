import { Comanda } from "../database";
import { CreateComanda } from "../dto";
import { ComandaStatus } from "../enum";
import { ComandaRepository } from "../repository";

export class ComandaService {

    private comandaRepository: ComandaRepository

    constructor(comandaRepository: ComandaRepository) {
        this.comandaRepository = comandaRepository
    }

    async createComanda(comanda: CreateComanda) {
        if(!comanda.total) 
            comanda.total = 0

        if(!comanda.status) 
            comanda.status = ComandaStatus.ABERTA

        const {id} = await this.comandaRepository.createComanda(comanda) 

        return id
    }

    async listComandas() {
        return await this.comandaRepository.listComandas()
    }

    async getComanda(comandaId: number) {
        return await this.comandaRepository.getComanda(comandaId)
    }

    async updateComandaTotal(comanda: Comanda, total: number) {
        total += Number(comanda.total)
        await this.comandaRepository.updateComandaTotal(comanda.id, total)

    }
}