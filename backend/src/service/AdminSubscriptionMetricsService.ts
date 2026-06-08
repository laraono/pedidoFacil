import { AdminSubscriptionMetricsRepository } from '../repository/AdminSubscriptionMetricsRepository';
import { SubscriptionPaymentRepository } from '../repository/SubscriptionPaymentRepository';

export class AdminSubscriptionMetricsService {
    constructor(
        private repo: AdminSubscriptionMetricsRepository,
        private paymentRepo: SubscriptionPaymentRepository,
    ) {}

    async getMetrics(period: '3m' | '6m' | '12m' = '12m') {
        const intervalMonths = period === '3m' ? 3 : period === '6m' ? 6 : 12;

        const end = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - intervalMonths);

        const [
            totalAtivas,
            inadimplentes,
            canceladas,
            totalGeral,
            porPlanoRaw,
            novosPorMesRaw,
            revenueMetrics,
        ] = await Promise.all([
            this.repo.getActiveCount(),
            this.repo.getOverdueCount(),
            this.repo.getCanceledCount(),
            this.repo.getTotalCount(),
            this.repo.getByPlan(),
            this.repo.getNewPerMonth(intervalMonths),
            this.paymentRepo.getMetricsForPeriod(start, end),
        ]);

        return {
            totalAtivas,
            inadimplentes,
            canceladas,
            totalGeral,
            receitaMensal: revenueMetrics.mrr,
            receitaColetada: revenueMetrics.receitaColetada,
            porPlano: porPlanoRaw.map((row: any) => ({
                planId: row.planId,
                planName: row.planName,
                total: Number(row.total),
                ativas: Number(row.ativas),
                canceladas: Number(row.canceladas),
                pendentes: Number(row.pendentes),
                expiradas: Number(row.expiradas),
            })),
            novosPorMes: novosPorMesRaw.map((row: any) => ({
                mes: row.mes,
                novos: Number(row.novos),
            })),
        };
    }
}
