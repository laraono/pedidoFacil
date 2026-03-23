import { EntityManager } from "typeorm";
import { Comanda } from "../database";
import { CancelComanda, CreateComanda } from "../dto";
import { ComandaStatus } from "../enum";
import { AppError } from "../middleware";
import { ComandaRepository, UserRepository } from "../repository";

export class ComandaService {

    private comandaRepository: ComandaRepository
    private userRepository: UserRepository

    constructor(comandaRepository: ComandaRepository, userRepository: UserRepository) {
        this.comandaRepository = comandaRepository
        this.userRepository = userRepository
    }

    async createComanda(comanda: CreateComanda) {

        const checkDescription = await this.checkComandaDescription(comanda.description)

        if(!checkDescription) {
            const {id} = await this.comandaRepository.createComanda(comanda) 

            return id
        } else {
            throw new AppError('Duas comandas abertas não podem ter o mesmo nome', 400)
        }
        
    }

    async listComandas() {
        return await this.comandaRepository.listComandas()
    }

    async listComandasByStatus(status: ComandaStatus) {
        return await this.comandaRepository.listComandasByStatus(status)
    }

    async getComanda(comandaId: number) {
        return await this.comandaRepository.getComanda(comandaId)
    }

    async checkComandaDescription(description: string) {
        const [comanda] = await this.comandaRepository.getComandaByDesc(description)

        if(comanda) {
            return true
        }

        return false

    }

    async updateComandaTotal(comanda: Comanda, total: number) {
        total += Number(comanda.total)
        await this.comandaRepository.updateComandaTotal(comanda.id, total)
    }

    async updateComandaTotalTransaction(
        comanda: Comanda, 
        total: number,
        manager: EntityManager
    ) {
        total += Number(comanda.total)
        await manager.update(Comanda, comanda.id, { total })
    }    

    async updateComandaStatus(comandaId: number, status: ComandaStatus) {
        await this.comandaRepository.updateComandaStatus(comandaId, status)
    }

    async cancelComanda(params: CancelComanda) {

        const user = await this.userRepository.getUser(params.userId)

        if(!user) {
            throw new AppError('Usuário não existe', 409)
        }

        await this.comandaRepository.cancelComanda(
            params.comandaId, 
            {
                user, 
                reason: params.reason, 
                status: ComandaStatus.CANCELADA
            }
        )
    }
}