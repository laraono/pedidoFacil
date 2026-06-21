import { AdminSubscriptionMetricsRepository } from '../repository/AdminSubscriptionMetricsRepository';
import { SubscriptionPaymentRepository } from '../repository/SubscriptionPaymentRepository';

export class AdminSubscriptionMetricsService {
    constructor(
        private repo: AdminSubscriptionMetricsRepository,
        private paymentRepo: SubscriptionPaymentRepository,
    ) {}

    async getMetrics(period: '3m' | '6m' | '12m' | 'all' = '12m') {
        const periodMap: Record<string, number | null> = { '3m': 3, '6m': 6, '12m': 12, 'all': null };
        const intervalMonths = periodMap[period] ?? null;

        const end = new Date();
        const start: Date | null = intervalMonths !== null
            ? new Date(new Date().setMonth(new Date().getMonth() - intervalMonths))
            : null;

        const [
            totalAtivas,
            inadimplentes,
            canceladas,
            totalGeral,
            porPlanoRaw,
            novosPorMesRaw,
            receitaPorMesRaw,
            revenueMetrics,
            mrrReal,
        ] = await Promise.all([
            this.repo.getActiveCount(),
            this.repo.getOverdueCount(),
            this.repo.getCanceledCount(),
            this.repo.getTotalCount(),
            this.repo.getByPlan(),
            this.repo.getNewPerMonth(intervalMonths),
            this.repo.getRevenuePerMonth(intervalMonths),
            this.paymentRepo.getMetricsForPeriod(start, end),
            this.repo.getMrr(),
        ]);

        return {
            totalAtivas,
            inadimplentes,
            canceladas,
            totalGeral,
            receitaMensal: mrrReal,
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
            receitaPorMes: receitaPorMesRaw.map((row: any) => ({
                mes: row.mes,
                receita: Number(row.receita ?? 0),
            })),
        };
    }
}
