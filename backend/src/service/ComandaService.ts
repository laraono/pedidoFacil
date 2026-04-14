import { DataSource, EntityManager } from "typeorm";
import { Comanda } from "../database";
import { CancelComanda, CreateComanda } from "../dto";
import { ComandaStatus, OrderStatus } from "../enum";
import { AppError } from "../middleware";
import { ComandaRepository, EstablishmentRepository, OrderRepository, UserRepository } from "../repository";
import { PaymentService } from "./PaymentService";
import { ReceiptService } from "./ReceiptService";

export class ComandaService {

    constructor(
        private dataSource: DataSource,
        private paymentService: PaymentService,
        private receiptService: ReceiptService,
        private comandaRepository: ComandaRepository,
        private establishmentRepository: EstablishmentRepository,
        private orderRepository: OrderRepository,
        private userRepository: UserRepository
    ) {}

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

        if(!comanda) {
            throw new AppError('Comanda não encontrada', 404)
        }

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

    async checkoutComanda(
        comandaId: number,
        userId: number,
        establishmentId: number,
        checkoutData: any,
    ) {
        let firstPaymentId: number | null = null;

        const result = await this.dataSource.transaction(async (manager) => {
        const comanda = await manager.findOne(Comanda, {
            where: { id: comandaId, establishment: { id: establishmentId } },
            relations: ['pedidos'],
        });

        if (!comanda) throw new AppError('Comanda não encontrada.', 404);
        if (comanda.status === ComandaStatus.FECHADA)
            throw new AppError('Esta comanda já está fechada.', 400);

        const pedidos = comanda.orders || [];
        const validOrders = pedidos.filter(
            (p) => p.status !== OrderStatus.CANCELADO,
        );

        comanda.discountType = checkoutData.discountType || null;
        comanda.discountValue = checkoutData.discountValue || 0;
        comanda.total = checkoutData.totalValue;
        comanda.status = ComandaStatus.FECHADA;

        await manager.save(Comanda, comanda);

        const paymentsArray = Array.isArray(checkoutData.payments)
            ? checkoutData.payments
            : [{ type: checkoutData.paymentType, amount: checkoutData.totalValue }];

        const registeredPayments =
            await this.paymentService.processCheckoutPayments(
            comandaId,
            validOrders,
            paymentsArray,
            checkoutData.change || 0,
            establishmentId,
            userId,
            manager,
            );

        if (registeredPayments.length > 0) {
            firstPaymentId = registeredPayments[0].id;
        }

        return {
            success: true,
            message: 'Comanda finalizada com sucesso.',
            comanda,
            payments: registeredPayments,
        };
        });

        if (firstPaymentId) {
        try {
            await this.receiptService.generateReceipt(
            firstPaymentId,
            establishmentId,
            checkoutData.cpfcnpj || null,
            );
        } catch (error: any) {
            console.error(
            '⚠️ [ComandaService] Erro ao gerar Nota Fiscal:',
            error.message,
            );
        }
        }

        return result;
    }
}
