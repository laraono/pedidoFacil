import { EntityManager } from "typeorm";
import { Comanda } from "../database";
import { CancelComanda, CreateComanda } from "../dto";
import { ComandaStatus } from "../enum";
import { AppError } from "../middleware";
import { ComandaRepository, UserRepository, PaymentRepository } from "../repository";
import { ReceiptService } from "./ReceiptService";
import { PaymentStatus } from "../database/entity/Payment";

export class ComandaService {

    private comandaRepository: ComandaRepository;
    private userRepository: UserRepository;
    private paymentRepository: PaymentRepository;
    private receiptService: ReceiptService;

    constructor(
        comandaRepository: ComandaRepository, 
        userRepository: UserRepository,
        paymentRepository: PaymentRepository,
        receiptService: ReceiptService
    ) {
        this.comandaRepository = comandaRepository;
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
        this.receiptService = receiptService;
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

    async checkoutComanda(comandaId: number, userId: number, establishmentId: number, paymentData: any) {
        const comanda = await this.comandaRepository.getComanda(comandaId);
        if (!comanda) throw new AppError('Comanda não encontrada', 404);

        const payment = await this.paymentRepository.save({
            paymentType: paymentData.paymentType || 'Múltiplos',
            totalValue: paymentData.totalValue,
            serviceTax: 0,
            change: paymentData.change || 0,
            status: PaymentStatus.PAID,
            establishment: { id: establishmentId },
            user: { id: userId }
        });

        await this.comandaRepository.updateComandaStatus(comandaId, ComandaStatus.FECHADA);

        try {
            await this.receiptService.generateReceipt(payment.id, establishmentId, paymentData.cpfCnpj);
            console.log(`🧾 NF gerada com sucesso para comanda ${comandaId}`);
        } catch (error: any) {
            console.error(`Aviso: Falha ao emitir NF da comanda ${comandaId}:`, error.message);
        }

        return payment;
    }
}