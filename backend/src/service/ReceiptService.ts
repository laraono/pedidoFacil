import { AppDataSource } from '../database/data-source';
import { Receipt } from '../database/entity/Receipt';
import { Payment } from '../database/entity/Payment';
import { AppError } from '../middleware/error/AppError';

export class ReceiptService {
    private receiptRepository = AppDataSource.getRepository(Receipt);
    private paymentRepository = AppDataSource.getRepository(Payment);

    // Gera um novo recibo/nota para um pagamento específico
    async generateReceipt(paymentId: number, establishmentId: number, cpfCnpjCliente?: string) {
        // Verifica se o pagamento existe e pertence a este estabelecimento
        const payment = await this.paymentRepository.findOne({
            where: { id: paymentId, establishment: { id: establishmentId } },
            relations: ['paymentOrders', 'paymentOrders.order']
        });

        if (!payment) {
            throw new AppError('Pagamento não encontrado ou não pertence ao seu estabelecimento.', 404);
        }

        // Verifica se já existe uma nota para este pagamento
        const existingReceipt = await this.receiptRepository.findOne({
            where: { payment: { id: paymentId } }
        });

        if (existingReceipt) {
            throw new AppError('Já existe uma nota fiscal/recibo gerado para este pagamento.', 400);
        }

        // Gera um número de recibo fictício (No mundo real, integraria com API de NFe)
        const timestamp = new Date().getTime();
        const receiptNumber = `NFE-${establishmentId}-${timestamp}`;

        const receipt = this.receiptRepository.create({
            recepitNumber: receiptNumber,
            cpfcnpj: cpfCnpjCliente || null,
            payment: payment
        });

        return await this.receiptRepository.save(receipt);
    }

    // Busca os dados completos para o Frontend montar o PDF/Impressão
    async getReceiptDetails(receiptId: number, establishmentId: number) {
        const receipt = await this.receiptRepository.findOne({
            where: { id: receiptId, payment: { establishment: { id: establishmentId } } },
            relations: [
                'payment', 
                'payment.user', // Caixa que atendeu
                'payment.paymentOrders', 
                'payment.paymentOrders.order',
                'payment.paymentOrders.order.productOrders',
                'payment.paymentOrders.order.productOrders.product'
            ]
        });

        if (!receipt) {
            throw new AppError('Recibo não encontrado.', 404);
        }

        return receipt;
    }

    // Lista todas as notas fiscais geradas pelo estabelecimento
    async listEstablishmentReceipts(establishmentId: number) {
        return await this.receiptRepository.find({
            where: { payment: { establishment: { id: establishmentId } } },
            relations: ['payment'],
            order: { created_at: 'DESC' }
        });
    }
}