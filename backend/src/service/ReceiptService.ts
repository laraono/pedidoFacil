import { ReceiptRepository } from '../repository/ReceiptRepository';
import { EstablishmentRepository } from '../repository/EstablishmentRepository';
import { PaymentRepository } from '../repository/PaymentRepository';
import { AppError } from '../middleware/error/AppError';
import { STATUS_NOTA_FISCAL_IDS } from '../database/entity/lookup-ids';

export class ReceiptService {
    constructor(
        private receiptRepository: ReceiptRepository,
        private paymentRepository: PaymentRepository,
        private establishmentRepository: EstablishmentRepository
    ) {}

    async generateReceipt(paymentId: number, establishmentId: number, cpfCnpj?: string) {
        const establishment = await this.establishmentRepository.findOne({
            where: { id: establishmentId }
        });

        if (!establishment?.cnpj) {
            throw new AppError('CNPJ do estabelecimento não configurado para emissão de NF.', 400);
        }

        const payment = await this.paymentRepository.findOne({
            where: {
                id: paymentId,
                establishment: { id: establishmentId }
            },
            relations: ['paymentOrders']
        });

        if (!payment) throw new AppError('Pagamento não encontrado.', 404);

        const timestamp = new Date().getTime();
        const receipt = this.receiptRepository.create({
            receiptNumber: `001.${String(timestamp).slice(-3)}`,
            cpfcnpj: cpfCnpj || null,
            totalValue: payment.totalValue,
            status: { id: STATUS_NOTA_FISCAL_IDS.AUTORIZADA } as any,
            payment: payment,
        });

        return await this.receiptRepository.save(receipt);
    }

    async listReceipts(establishmentId: number, filters: any) {
        return await this.receiptRepository.findByEstablishment(establishmentId, filters);
    }

    async cancelReceipt(receiptId: number, establishmentId: number) {
        const receipt = await this.receiptRepository.findOne({
            where: {
                payment: { establishment: { id: establishmentId } } as any,
                id: receiptId,
            }
        });

        if (!receipt) throw new AppError('Nota Fiscal não encontrada.', 404);

        receipt.status = { id: STATUS_NOTA_FISCAL_IDS.CANCELADA } as any;
        return await this.receiptRepository.save(receipt);
    }

    async getMetrics(establishmentId: number, startDate: string, endDate: string) {
        const start = new Date(startDate.includes('T') ? startDate : `${startDate}T00:00:00.000Z`);
        const end = new Date(endDate.includes('T') ? endDate : `${endDate}T23:59:59.999Z`);
        return await this.receiptRepository.getMetrics(establishmentId, start, end);
    }
}
