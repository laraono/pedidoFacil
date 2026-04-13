import { EntityManager } from "typeorm";
import { Comanda } from "../database";
import { CancelComanda, CreateComanda } from "../dto";
import { ComandaStatus, OrderStatus } from "../enum";
import { AppError } from "../middleware";
import { ComandaRepository, EstablishmentRepository, OrderRepository, UserRepository } from "../repository";

export class ComandaService {

    private comandaRepository: ComandaRepository
    private establishmentRepository: EstablishmentRepository
    private orderRepository: OrderRepository
    private userRepository: UserRepository

    constructor(
        comandaRepository: ComandaRepository, 
        establishmentRepository: EstablishmentRepository,
        orderRepository: OrderRepository,
        userRepository: UserRepository
    ) {
        this.comandaRepository = comandaRepository
        this.establishmentRepository = establishmentRepository
        this.orderRepository = orderRepository
        this.userRepository = userRepository
    }

    async createComanda(comanda: CreateComanda) {

        const checkDescription = await this.checkComandaDescription(comanda.description)

        if(!checkDescription) {
            const establishment = await this.establishmentRepository.getEstablishment(comanda.establishmentId)

            if(!establishment) {
                throw new AppError("Estabelecimento não encontrado", 400)
            }

            const comandaParams = { ...comanda, establishment, total: 0}

            const {id} = await this.comandaRepository.createComanda(comandaParams) 

            return id
        } else {
            throw new AppError('Duas comandas abertas não podem ter o mesmo nome', 400)
        }
    }

    async listComandas(establishmentId: number) {
        return await this.comandaRepository.listComandas(establishmentId)
    }

    async listComandasByStatus({status, establishmentId}: {status: ComandaStatus, establishmentId: number}) {
        return await this.comandaRepository.listComandasByStatus(status, establishmentId)
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

        const establishment = await this.establishmentRepository.getEstablishment(params.establishmentId)

        if(!establishment) {
            throw new AppError("Estabelecimento não encontrado", 400)
        }

        await this.comandaRepository.cancelComanda(
            params.comandaId, 
            {
                user, 
                establishment,
                reason: params.reason, 
                status: ComandaStatus.CANCELADA
            }
        )

        const comanda = await this.comandaRepository.getComanda(params.comandaId)

        comanda.orders.forEach(async (order) => {
            await this.orderRepository.cancelOrder(
                order.id, 
                {
                    status: OrderStatus.CANCELADO,
                    user,
                    cancellationDescription: params.reason
                }
            )
        })
    }
}
