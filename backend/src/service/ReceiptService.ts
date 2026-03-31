import { AppDataSource } from '../database/data-source';
import { Receipt } from '../database/entity/Receipt';
import { Payment } from '../database/entity/Payment';
import { AppError } from '../middleware/error/AppError';

export class ReceiptService {
    private receiptRepository = AppDataSource.getRepository(Receipt);
    private paymentRepository = AppDataSource.getRepository(Payment);

    async generateReceipt(paymentId: number, establishmentId: number, cpfCnpjCliente?: string) {
        const payment = await this.paymentRepository.findOne({
            where: { id: paymentId, establishment: { id: establishmentId } },
            relations: ['paymentOrders', 'paymentOrders.order']
        });

        if (!payment) {
            throw new AppError('Pagamento não encontrado ou não pertence ao seu estabelecimento.', 404);
        }

        const existingReceipt = await this.receiptRepository.findOne({
            where: { payment: { id: paymentId } }
        });

        if (existingReceipt) {
            throw new AppError('Já existe uma nota fiscal/recibo gerado para este pagamento.', 400);
        }

        const timestamp = new Date().getTime();
        const receiptNumber = `NFE-${establishmentId}-${timestamp}`;

        const receipt = this.receiptRepository.create({
            recepitNumber: receiptNumber,
            cpfcnpj: cpfCnpjCliente || null,
            payment: payment
        });

        return await this.receiptRepository.save(receipt);
    }

    async getReceiptDetails(receiptId: number, establishmentId: number) {
        const receipt = await this.receiptRepository.findOne({
            where: { id: receiptId, payment: { establishment: { id: establishmentId } } },
            relations: [
                'payment', 
                'payment.user',
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

    async listEstablishmentReceipts(establishmentId: number) {
        return await this.receiptRepository.find({
            where: { payment: { establishment: { id: establishmentId } } },
            relations: ['payment'],
            order: { created_at: 'DESC' }
        });
    }
}