import { ReceiptRepository } from '../repository/ReceiptRepository';
import { ReceiptStatus } from '../database/entity/Receipt';
import { Between, IsNull, Not } from 'typeorm';
import { AppError } from '../middleware/error/AppError';

export class MetricsService {
    constructor(private receiptRepository: ReceiptRepository) {}

    async getReceiptMetrics(establishmentId: number, startDate: string, endDate: string) {
        if (!startDate || !endDate) {
            throw new AppError('Parâmetros de data (startDate e endDate) são obrigatórios.', 400);
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        // Garante que a data final pegue até o último segundo do dia
        end.setHours(23, 59, 59, 999);

        const dateFilter = Between(start, end);

        // 1. Contagem de Notas Emitidas (Autorizadas)
        const emitidasCount = await this.receiptRepository.count({
            where: { 
                establishment: { id: establishmentId },
                status: ReceiptStatus.AUTORIZADA,
                createdAt: dateFilter
            }
        });

        // 2. Cálculo do Faturamento (Soma do totalValue) usando innerJoin para evitar erros de mapeamento de colunas
        const faturamento = await this.receiptRepository
            .createQueryBuilder("receipt")
            .select("SUM(receipt.totalValue)", "total")
            .innerJoin("receipt.establishment", "establishment")
            .where("establishment.id = :establishmentId", { establishmentId })
            .andWhere("receipt.status = :status", { status: ReceiptStatus.AUTORIZADA })
            .andWhere("receipt.createdAt BETWEEN :start AND :end", { start, end })
            .getRawOne();

        // 3. Contagem de Notas com CPF na base
        const comCpfCount = await this.receiptRepository.count({
            where: {
                establishment: { id: establishmentId },
                status: ReceiptStatus.AUTORIZADA,
                cpfcnpj: Not(IsNull()),
                createdAt: dateFilter
            }
        });

        // 4. Contagem de Notas com Erro
        const comErroCount = await this.receiptRepository.count({
            where: {
                establishment: { id: establishmentId },
                status: ReceiptStatus.ERRO,
                createdAt: dateFilter
            }
        });

        return {
            emitidas: emitidasCount,
            faturado: parseFloat(faturamento?.total || 0),
            comCpf: comCpfCount,
            comErro: comErroCount
        };
    }
}