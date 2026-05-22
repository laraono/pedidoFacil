import { DataSource, Repository, Between } from "typeorm";
import { Receipt } from "../database/entity/Receipt";

export class ReceiptRepository extends Repository<Receipt> {
    constructor(private dataSource: DataSource) {
        super(Receipt, dataSource.createEntityManager());
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