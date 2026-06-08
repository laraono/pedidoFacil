import { DataSource, Repository, Between, IsNull, Not } from "typeorm";
import { Receipt } from "../database/entity/Receipt";
import { ReceiptStatus } from "../enum";

export class ReceiptRepository extends Repository<Receipt> {
    constructor(private dataSource: DataSource) {
        super(Receipt, dataSource.createEntityManager());
    }

    async getMetrics(establishmentId: number, start: Date, end: Date) {
        const dateFilter = Between(start, end);
        const baseWhere = { establishment: { id: establishmentId }, createdAt: dateFilter };

        const [emitidas, faturamentoRaw, comCpf, comErro] = await Promise.all([
            this.count({ where: { ...baseWhere, status: ReceiptStatus.AUTORIZADA } }),
            this.createQueryBuilder('receipt')
                .select('SUM(receipt.totalValue)', 'total')
                .innerJoin('receipt.establishment', 'e')
                .where('e.id = :id', { id: establishmentId })
                .andWhere('receipt.status = :status', { status: ReceiptStatus.AUTORIZADA })
                .andWhere('receipt.createdAt BETWEEN :start AND :end', { start, end })
                .getRawOne(),
            this.count({ where: { ...baseWhere, status: ReceiptStatus.AUTORIZADA, cpfcnpj: Not(IsNull()) } }),
            this.count({ where: { ...baseWhere, status: ReceiptStatus.ERRO } }),
        ]);

        return {
            emitidas,
            faturado: parseFloat(faturamentoRaw?.total || 0),
            comCpf,
            comErro,
        };
    }

    async findByEstablishment(establishmentId: number, filters: any) {
        const { status, startDate, endDate } = filters;
        const where: any = { establishment: { id: establishmentId } };

        if (status && status !== 'todas') where.status = status;
        
        if (startDate && endDate) {
            const start = startDate.includes('T') ? startDate : `${startDate}T00:00:00.000Z`;
            const end = endDate.includes('T') ? endDate : `${endDate}T23:59:59.999Z`;

            where.createdAt = Between(new Date(start), new Date(end));
        }

        return await this.find({
            where,
            relations: ['payment', 'payment.user'],
            order: { createdAt: 'DESC' }
        });
    }
}