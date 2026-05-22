import { DataSource } from 'typeorm';
import { SubscriptionStatus } from '../enum';

export class AdminSubscriptionMetricsService {
    constructor(private dataSource: DataSource) {}

    async getMetrics() {
        const [activeResult] = await this.dataSource.query(`
            SELECT COUNT(*) as total FROM ASSINATURA
            WHERE Status = ?
        `, [SubscriptionStatus.PAGA]);

        const [revenueResult] = await this.dataSource.query(`
            SELECT COALESCE(SUM(a.Valor), 0) as total
            FROM ASSINATURA a
            WHERE a.Status = ?
        `, [SubscriptionStatus.PAGA]);

        const [overdueResult] = await this.dataSource.query(`
            SELECT COUNT(*) as total FROM ASSINATURA
            WHERE Status = ? AND Data_Vencimento_Prox < CURDATE()
        `, [SubscriptionStatus.PENDENTE]);

        const [canceledResult] = await this.dataSource.query(`
            SELECT COUNT(*) as total FROM ASSINATURA
            WHERE Status = ?
        `, [SubscriptionStatus.CANCELADA]);

        const byPlan = await this.dataSource.query(`
            SELECT p.Nome as planName, p.ID_Plano as planId,
                   COUNT(a.ID_Assinatura) as total,
                   SUM(CASE WHEN a.Status = 'Paga' THEN 1 ELSE 0 END) as ativas,
                   SUM(CASE WHEN a.Status = 'Cancelada' THEN 1 ELSE 0 END) as canceladas,
                   SUM(CASE WHEN a.Status = 'Pendente' THEN 1 ELSE 0 END) as pendentes,
                   SUM(CASE WHEN a.Status = 'Expirada' THEN 1 ELSE 0 END) as expiradas
            FROM PLANO p
            LEFT JOIN ASSINATURA a ON a.ID_Plano = p.ID_Plano
            GROUP BY p.ID_Plano, p.Nome
            ORDER BY p.Nome ASC
        `);

        const newPerMonth = await this.dataSource.query(`
            SELECT DATE_FORMAT(Data_Inicio, '%Y-%m') as mes,
                   COUNT(*) as novos
            FROM ASSINATURA
            WHERE Data_Inicio >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(Data_Inicio, '%Y-%m')
            ORDER BY mes ASC
        `);

        const [totalResult] = await this.dataSource.query(`
            SELECT COUNT(*) as total FROM ASSINATURA
        `);

        return {
            totalAtivas: Number(activeResult.total),
            receitaMensal: Number(revenueResult.total),
            inadimplentes: Number(overdueResult.total),
            canceladas: Number(canceledResult.total),
            totalGeral: Number(totalResult.total),
            porPlano: byPlan.map((row: any) => ({
                planId: row.planId,
                planName: row.planName,
                total: Number(row.total),
                ativas: Number(row.ativas),
                canceladas: Number(row.canceladas),
                pendentes: Number(row.pendentes),
                expiradas: Number(row.expiradas),
            })),
            novosPorMes: newPerMonth.map((row: any) => ({
                mes: row.mes,
                novos: Number(row.novos),
            })),
        };
    }
}
