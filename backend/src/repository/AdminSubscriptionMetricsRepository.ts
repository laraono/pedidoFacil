import { DataSource } from 'typeorm';
import { SubscriptionStatus } from '../enum';

export class AdminSubscriptionMetricsRepository {
    constructor(private dataSource: DataSource) {}

    async getActiveCount(): Promise<number> {
        const [row] = await this.dataSource.query(
            `SELECT COUNT(*) as total FROM ASSINATURA WHERE Status = ?`,
            [SubscriptionStatus.PAGA],
        );
        return Number(row.total);
    }

    async getOverdueCount(): Promise<number> {
        const [row] = await this.dataSource.query(
            `SELECT COUNT(*) as total FROM ASSINATURA WHERE Status = ? AND Data_Vencimento_Prox < CURDATE()`,
            [SubscriptionStatus.PENDENTE],
        );
        return Number(row.total);
    }

    async getCanceledCount(): Promise<number> {
        const [row] = await this.dataSource.query(
            `SELECT COUNT(*) as total FROM ASSINATURA WHERE Status = ?`,
            [SubscriptionStatus.CANCELADA],
        );
        return Number(row.total);
    }

    async getTotalCount(): Promise<number> {
        const [row] = await this.dataSource.query(
            `SELECT COUNT(*) as total FROM ASSINATURA`,
        );
        return Number(row.total);
    }

    async getByPlan() {
        return this.dataSource.query(`
            SELECT p.Nome as planName, p.ID_Plano as planId,
                   COUNT(a.ID_Assinatura) as total,
                   SUM(CASE WHEN a.Status = '${SubscriptionStatus.PAGA}'     THEN 1 ELSE 0 END) as ativas,
                   SUM(CASE WHEN a.Status = '${SubscriptionStatus.CANCELADA}' THEN 1 ELSE 0 END) as canceladas,
                   SUM(CASE WHEN a.Status = '${SubscriptionStatus.PENDENTE}'  THEN 1 ELSE 0 END) as pendentes,
                   SUM(CASE WHEN a.Status = '${SubscriptionStatus.EXPIRADA}'  THEN 1 ELSE 0 END) as expiradas
            FROM PLANO p
            LEFT JOIN ASSINATURA a ON a.ID_Plano = p.ID_Plano
            GROUP BY p.ID_Plano, p.Nome
            ORDER BY p.Nome ASC
        `);
    }

    async getNewPerMonth(intervalMonths: number) {
        return this.dataSource.query(
            `SELECT DATE_FORMAT(Data_Inicio, '%Y-%m') as mes, COUNT(*) as novos
             FROM ASSINATURA
             WHERE Data_Inicio >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
             GROUP BY DATE_FORMAT(Data_Inicio, '%Y-%m')
             ORDER BY mes ASC`,
            [intervalMonths],
        );
    }
}
