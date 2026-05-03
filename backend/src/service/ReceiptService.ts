import { ReceiptRepository } from '../repository/ReceiptRepository';
import { EstablishmentRepository } from '../repository/EstablishmentRepository';
import { PaymentRepository } from '../repository/PaymentRepository';
import { AppError } from '../middleware/error/AppError';
import { ReceiptStatus } from '../database/entity/Receipt';
import { nuvemFiscalService } from './NuvemFiscalService';

const CANCEL_WINDOW_MINUTES = 30;

export class ReceiptService {
    constructor(
        private receiptRepository: ReceiptRepository,
        private paymentRepository: PaymentRepository,
        private establishmentRepository: EstablishmentRepository
    ) {}

    async generateReceipt(paymentId: number, establishmentId: number, cpfCnpj?: string, simulate = false, simulatedValue?: number) {
        const establishment = await this.establishmentRepository.findOne({
            where: { id: establishmentId }
        });

        if (!establishment?.cnpj) {
            throw new AppError('CNPJ do estabelecimento não configurado para emissão de NF.', 400);
        }

        let resolvedValue: number;
        let payment = null;

        if (simulate) {
            if (!simulatedValue || simulatedValue <= 0) {
                throw new AppError('Informe um valor válido para a simulação.', 400);
            }
            resolvedValue = simulatedValue;
        } else {
            payment = await this.paymentRepository.findOne({
                where: {
                    id: paymentId,
                    establishment: { id: establishmentId }
                },
                relations: ['paymentOrders']
            });

            if (!payment) throw new AppError('Pagamento não encontrado.', 404);
            resolvedValue = Number(payment.totalValue);
        }

        const receipt = this.receiptRepository.create({
            receiptNumber: null,
            cpfcnpj: cpfCnpj || null,
            totalValue: resolvedValue,
            status: ReceiptStatus.PENDENTE,
            payment: payment,
            establishment: establishment,
        });

        const savedReceipt = await this.receiptRepository.save(receipt);

        try {
            const result = await nuvemFiscalService.emitirNFe(
                establishment.cnpj,
                establishment.name,
                resolvedValue,
                cpfCnpj
            );

            savedReceipt.providerNfId    = result.id;
            savedReceipt.receiptNumber   = result.numero;
            savedReceipt.urlDanfe        = result.urlDanfe;
            savedReceipt.codigoRetorno   = result.codigoRetorno;
            savedReceipt.mensagemRetorno = result.mensagemRetorno;
            savedReceipt.status          = result.status === 'autorizada'
                ? ReceiptStatus.AUTORIZADA
                : result.status === 'erro'
                ? ReceiptStatus.ERRO
                : ReceiptStatus.PENDENTE;

        } catch (err: any) {
            savedReceipt.status          = ReceiptStatus.ERRO;
            savedReceipt.codigoRetorno   = '999';
            savedReceipt.mensagemRetorno = err?.message ?? 'Erro desconhecido na comunicação com Nuvem Fiscal.';
        }

        return await this.receiptRepository.save(savedReceipt);
    }

    async reissueReceipt(receiptId: number, establishmentId: number) {
        const receipt = await this.receiptRepository.findOne({
            where: { id: receiptId, establishment: { id: establishmentId } },
            relations: ['payment', 'establishment'],
        });

        if (!receipt) throw new AppError('Nota Fiscal não encontrada.', 404);

        if (receipt.status === ReceiptStatus.AUTORIZADA) {
            throw new AppError('Esta nota já está autorizada. Não é possível reemitir.', 400);
        }

        if (receipt.status === ReceiptStatus.CANCELADA) {
            throw new AppError('Notas canceladas não podem ser reemitidas.', 400);
        }

        receipt.status          = ReceiptStatus.PENDENTE;
        receipt.codigoRetorno   = null;
        receipt.mensagemRetorno = null;

        try {
            const result = await nuvemFiscalService.emitirNFe(
                receipt.establishment.cnpj,
                receipt.establishment.name,
                Number(receipt.totalValue),
                receipt.cpfcnpj
            );

            receipt.providerNfId    = result.id;
            receipt.receiptNumber   = result.numero;
            receipt.urlDanfe        = result.urlDanfe;
            receipt.codigoRetorno   = result.codigoRetorno;
            receipt.mensagemRetorno = result.mensagemRetorno;
            receipt.status          = result.status === 'autorizada'
                ? ReceiptStatus.AUTORIZADA
                : ReceiptStatus.ERRO;

        } catch (err: any) {
            receipt.status          = ReceiptStatus.ERRO;
            receipt.codigoRetorno   = '999';
            receipt.mensagemRetorno = err?.message ?? 'Erro na reemissão.';
        }

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

        if (receipt.status !== ReceiptStatus.AUTORIZADA) {
            throw new AppError('Apenas notas autorizadas podem ser canceladas.', 400);
        }

        const emissaoMs = new Date(receipt.createdAt).getTime();
        const diffMinutes = (Date.now() - emissaoMs) / 60_000;

        if (diffMinutes > CANCEL_WINDOW_MINUTES) {
            throw new AppError(
                `O cancelamento só é permitido até ${CANCEL_WINDOW_MINUTES} minutos após a emissão. Esta nota foi emitida há ${Math.floor(diffMinutes)} minutos.`,
                400
            );
        }

        if (receipt.providerNfId) {
            try {
                await nuvemFiscalService.cancelarNFe(receipt.providerNfId);
            } catch (err: any) {
                throw new AppError(`Erro ao cancelar na Nuvem Fiscal: ${err?.message}`, 502);
            }
        }

        receipt.status = ReceiptStatus.CANCELADA;
        await this.receiptRepository.save(receipt);
        return await this.receiptRepository.softRemove(receipt);
    }

    async getMetrics(establishmentId: number, startDate: string, endDate: string) {
        const start = startDate.includes('T') ? startDate : `${startDate}T00:00:00.000Z`;
        const end   = endDate.includes('T')   ? endDate   : `${endDate}T23:59:59.999Z`;

        const query = this.receiptRepository.createQueryBuilder('receipt')
            .where('receipt.ID_Estabelecimento = :establishmentId', { establishmentId })
            .andWhere('receipt.Data_Emissao BETWEEN :startDate AND :endDate', {
                startDate: new Date(start),
                endDate: new Date(end),
            });

        const receipts = await query.getMany();

        return {
            emitidas: receipts.filter(r => r.status === ReceiptStatus.AUTORIZADA).length,
            faturado: receipts
                .filter(r => r.status === ReceiptStatus.AUTORIZADA)
                .reduce((sum, r) => sum + Number(r.totalValue), 0),
            comCpf:  receipts.filter(r => !!r.cpfcnpj).length,
            comErro: receipts.filter(r => r.status === ReceiptStatus.ERRO).length,
        };
    }
}
