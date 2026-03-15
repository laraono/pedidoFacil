import { Comanda } from "../database/entity";
import { ComandaStatus } from "../enum";
import { ComandaRepository } from "../repository";

export class ComandaService {

    private comandaRepository: ComandaRepository

    constructor(comandaRepository: ComandaRepository) {
        this.comandaRepository = comandaRepository
    }

    async createComanda(comanda: Comanda) {
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
}