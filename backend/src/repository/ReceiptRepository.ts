import { DataSource, Repository, Between } from "typeorm";
import { Receipt } from "../database/entity/Receipt";
import { ReceiptStatus } from "../enum";

export class ReceiptRepository extends Repository<Receipt> {
    constructor(private dataSource: DataSource) {
        super(Receipt, dataSource.createEntityManager());
    }

    async getMetrics(establishmentId: number, start: Date, end: Date) {
        const qb = this.createQueryBuilder('receipt')
            .innerJoin('receipt.payment', 'pay')
            .innerJoin('receipt.status', 'st')
            .where('pay.establishment = :id', { id: establishmentId })
            .andWhere('receipt.createdAt BETWEEN :start AND :end', { start, end });

        const [emitidas, comCpf, comErro] = await Promise.all([
            qb.clone().andWhere('st.nome = :s', { s: ReceiptStatus.AUTORIZADA }).getCount(),
            qb.clone()
                .andWhere('st.nome = :s', { s: ReceiptStatus.AUTORIZADA })
                .andWhere('receipt.cpfcnpj IS NOT NULL')
                .getCount(),
            qb.clone()
                .andWhere('st.nome = :s', { s: ReceiptStatus.ERRO })
                .getCount(),
        ]);

        return { emitidas, comCpf, comErro };
    }

    async findByEstablishment(establishmentId: number, filters: any) {
        const { status, startDate, endDate } = filters;
        const where: any = { payment: { establishment: { id: establishmentId } } };

        if (status && status !== 'todas') where.status = { nome: status };

        if (startDate && endDate) {
            const start = startDate.includes('T') ? startDate : `${startDate}T00:00:00.000Z`;
            const end = endDate.includes('T') ? endDate : `${endDate}T23:59:59.999Z`;
            where.createdAt = Between(new Date(start), new Date(end));
        }

        return await this.find({
            where,
            relations: ['status', 'payment', 'payment.user'],
            order: { createdAt: 'DESC' },
        });
    }
}
