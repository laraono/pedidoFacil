import { DataSource, Repository } from "typeorm"
import { SubscriptionPayment } from "../database"
import { SubscriptionPaymentStatus } from "../enum"

export class SubscriptionPaymentRepository extends Repository<SubscriptionPayment> {

    constructor(dataSource: DataSource) {
        super(SubscriptionPayment, dataSource.createEntityManager())
    }

    async createPayment(data: Partial<SubscriptionPayment>): Promise<SubscriptionPayment> {
        return await this.save(data as SubscriptionPayment)
    }

    async getBySubscription(subscriptionId: number): Promise<SubscriptionPayment[]> {
        return await this.find({
            where: { subscription: { id: subscriptionId } },
            order: { paidAt: 'DESC' },
        })
    }

    async getMetricsForPeriod(start: Date | null, end: Date): Promise<{
        totalAtivos: number
        receitaColetada: number
        mrr: number
    }> {
        if (start !== null) {
            const result = await this.createQueryBuilder('p')
                .select('COUNT(DISTINCT p.subscription)', 'totalAtivos')
                .addSelect('SUM(p.amount)', 'receitaColetada')
                .where('p.status = :status', { status: SubscriptionPaymentStatus.APROVADO })
                .andWhere('p.paidAt BETWEEN :start AND :end', { start, end })
                .getRawOne()

            const totalAtivos = Number(result?.totalAtivos ?? 0)
            const receitaColetada = Number(result?.receitaColetada ?? 0)
            const months = Math.max(1, Math.round((end.getTime() - start.getTime()) / (30 * 24 * 60 * 60 * 1000)))
            return { totalAtivos, receitaColetada, mrr: receitaColetada / months }
        }

        const result = await this.createQueryBuilder('p')
            .select('COUNT(DISTINCT p.subscription)', 'totalAtivos')
            .addSelect('SUM(p.amount)', 'receitaColetada')
            .addSelect('MIN(p.paidAt)', 'earliest')
            .where('p.status = :status', { status: SubscriptionPaymentStatus.APROVADO })
            .getRawOne()

        const totalAtivos = Number(result?.totalAtivos ?? 0)
        const receitaColetada = Number(result?.receitaColetada ?? 0)
        const earliest = result?.earliest ? new Date(result.earliest) : end
        const months = Math.max(1, Math.round((end.getTime() - earliest.getTime()) / (30 * 24 * 60 * 60 * 1000)))
        return { totalAtivos, receitaColetada, mrr: receitaColetada / months }
    }
}
