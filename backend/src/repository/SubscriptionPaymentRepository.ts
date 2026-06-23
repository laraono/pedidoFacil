import { DataSource, Repository } from "typeorm"
import { SubscriptionPayment } from "../database"
import { STATUS_HISTORICO_IDS } from "../database/entity/lookup-ids"

export class SubscriptionPaymentRepository extends Repository<SubscriptionPayment> {

    constructor(dataSource: DataSource) {
        super(SubscriptionPayment, dataSource.createEntityManager())
    }

    async createPayment(data: Partial<SubscriptionPayment>): Promise<SubscriptionPayment> {
        return await this.save(data as SubscriptionPayment)
    }

    async recordPreapprovalPayment(params: {
        mercadoPagoId: string
        charged_quantity: number
        last_charged_amount: number
        last_charged_date: string | null
        planName: string
        subscriptionId: number
    }): Promise<void> {
        const paymentId = `preapproval_${params.mercadoPagoId}_q${params.charged_quantity}`
        const exists = await this.findOne({ where: { mercadoPagoPaymentId: paymentId } })
        if (exists) return
        await this.createPayment({
            mercadoPagoPaymentId: paymentId,
            amount: params.last_charged_amount,
            status: { id: STATUS_HISTORICO_IDS.APROVADO } as any,
            paymentType: 'Cartão',
            planName: params.planName,
            paidAt: params.last_charged_date ? new Date(params.last_charged_date) : new Date(),
            subscription: { id: params.subscriptionId } as any,
        })
    }

    async getBySubscription(subscriptionId: number): Promise<SubscriptionPayment[]> {
        return await this.find({
            where: { subscription: { id: subscriptionId } },
            relations: ['status'],
            order: { paidAt: 'DESC' },
        })
    }

    async getMetricsForPeriod(start: Date | null, end: Date): Promise<{
        totalAtivos: number
        receitaColetada: number
        mrr: number
    }> {
        const approvedId = STATUS_HISTORICO_IDS.APROVADO

        if (start !== null) {
            const result = await this.createQueryBuilder('p')
                .select('COUNT(DISTINCT p.subscription)', 'totalAtivos')
                .addSelect('SUM(p.amount)', 'receitaColetada')
                .where('p.ID_Status = :id', { id: approvedId })
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
            .where('p.ID_Status = :id', { id: approvedId })
            .getRawOne()

        const totalAtivos = Number(result?.totalAtivos ?? 0)
        const receitaColetada = Number(result?.receitaColetada ?? 0)
        const earliest = result?.earliest ? new Date(result.earliest) : end
        const months = Math.max(1, Math.round((end.getTime() - earliest.getTime()) / (30 * 24 * 60 * 60 * 1000)))
        return { totalAtivos, receitaColetada, mrr: receitaColetada / months }
    }
}
