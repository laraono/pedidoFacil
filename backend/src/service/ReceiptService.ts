import { ReceiptRepository } from '../repository/ReceiptRepository';
import { EstablishmentRepository } from '../repository/EstablishmentRepository';
import { PaymentRepository } from '../repository/PaymentRepository';
import { AppError } from '../middleware/error/AppError';
import { ReceiptStatus } from '../database/entity/Receipt';

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
            status: ReceiptStatus.AUTORIZADA,
            payment: payment,
            establishment: establishment
        });

        return await this.receiptRepository.save(receipt);
    }

    async listReceipts(establishmentId: number, filters: any) {
        return await this.receiptRepository.findByEstablishment(establishmentId, filters);
    }

    async cancelReceipt(receiptId: number, establishmentId: number) {
        const receipt = await this.receiptRepository.findOne({
            where: { 
                id: receiptId, 
                establishment: { id: establishmentId } 
            }
        });

        if (!receipt) throw new AppError('Nota Fiscal não encontrada.', 404);

        receipt.status = ReceiptStatus.CANCELADA;
        await this.receiptRepository.save(receipt);
        return await this.receiptRepository.softRemove(receipt);
    }


    async getMetrics(establishmentId: number, startDate: string, endDate: string) {
        // 🔥 SOLUÇÃO: A mesma blindagem para as métricas
        const start = startDate.includes('T') ? startDate : `${startDate}T00:00:00.000Z`;
        const end = endDate.includes('T') ? endDate : `${endDate}T23:59:59.999Z`;

        const query = this.receiptRepository.createQueryBuilder('receipt')
            .where('receipt.ID_Estabelecimento = :establishmentId', { establishmentId })
            .andWhere('receipt.Data_Emissao BETWEEN :startDate AND :endDate', { startDate: new Date(start), endDate: new Date(end) });

        const receipts = await query.getMany();

        return {
            emitidas: receipts.length,
            faturado: receipts
                .filter(r => r.status === ReceiptStatus.AUTORIZADA)
                .reduce((sum, r) => sum + Number(r.totalValue), 0),
            comCpf: receipts.filter(r => !!r.cpfcnpj).length,
            comErro: receipts.filter(r => r.status === ReceiptStatus.ERRO).length
        };
    }
}