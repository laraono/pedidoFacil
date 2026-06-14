import { DataSource } from 'typeorm';
import {
    STATUS_ASSINATURA_IDS,
    STATUS_HISTORICO_IDS,
} from '../database/entity/lookup-ids';

const SA_PAGA      = STATUS_ASSINATURA_IDS.PAGA;
const SA_PENDENTE  = STATUS_ASSINATURA_IDS.PENDENTE;
const SA_CANCELADA = STATUS_ASSINATURA_IDS.CANCELADA;
const SA_EXPIRADA  = STATUS_ASSINATURA_IDS.EXPIRADA;
const SH_APROVADO  = STATUS_HISTORICO_IDS.APROVADO;

export class AdminSubscriptionMetricsRepository {
    constructor(private dataSource: DataSource) {}

    async getActiveCount(): Promise<number> {
        const [row] = await this.dataSource.query(
            `SELECT COUNT(*) as total FROM ASSINATURA WHERE ID_Status = ?`,
            [SA_PAGA],
        );
        return Number(row.total);
    }

    async getOverdueCount(): Promise<number> {
        const [row] = await this.dataSource.query(
            `SELECT COUNT(*) as total FROM ASSINATURA WHERE ID_Status = ? AND Data_Vencimento_Prox < CURDATE()`,
            [SA_PENDENTE],
        );
        return Number(row.total);
    }

    async getCanceledCount(): Promise<number> {
        const [row] = await this.dataSource.query(
            `SELECT COUNT(*) as total FROM ASSINATURA WHERE ID_Status = ?`,
            [SA_CANCELADA],
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
                   SUM(CASE WHEN a.ID_Status = ${SA_PAGA}      THEN 1 ELSE 0 END) as ativas,
                   SUM(CASE WHEN a.ID_Status = ${SA_CANCELADA} THEN 1 ELSE 0 END) as canceladas,
                   SUM(CASE WHEN a.ID_Status = ${SA_PENDENTE}  THEN 1 ELSE 0 END) as pendentes,
                   SUM(CASE WHEN a.ID_Status = ${SA_EXPIRADA}  THEN 1 ELSE 0 END) as expiradas
            FROM PLANO p
            LEFT JOIN ASSINATURA a ON a.ID_Plano = p.ID_Plano
            GROUP BY p.ID_Plano, p.Nome
            ORDER BY p.Nome ASC
        `);
    }

    async getNewPerMonth(intervalMonths: number | null) {
        if (intervalMonths === null) {
            return this.dataSource.query(
                `SELECT DATE_FORMAT(Data_Inicio, '%Y-%m') as mes, COUNT(*) as novos
                 FROM ASSINATURA
                 GROUP BY DATE_FORMAT(Data_Inicio, '%Y-%m')
                 ORDER BY mes ASC`,
            );
        }
        return this.dataSource.query(
            `SELECT DATE_FORMAT(Data_Inicio, '%Y-%m') as mes, COUNT(*) as novos
             FROM ASSINATURA
             WHERE Data_Inicio >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
             GROUP BY DATE_FORMAT(Data_Inicio, '%Y-%m')
             ORDER BY mes ASC`,
            [intervalMonths],
        );
    }

    async getRevenuePerMonth(intervalMonths: number | null) {
        if (intervalMonths === null) {
            return this.dataSource.query(
                `SELECT DATE_FORMAT(p.Data_Pagamento, '%Y-%m') as mes, SUM(p.Valor) as receita
                 FROM HISTORICO_PAGAMENTO_ASSINATURA p
                 WHERE p.ID_Status = ${SH_APROVADO}
                 GROUP BY DATE_FORMAT(p.Data_Pagamento, '%Y-%m')
                 ORDER BY mes ASC`,
            );
        }
        return this.dataSource.query(
            `SELECT DATE_FORMAT(p.Data_Pagamento, '%Y-%m') as mes, SUM(p.Valor) as receita
             FROM HISTORICO_PAGAMENTO_ASSINATURA p
             WHERE p.ID_Status = ${SH_APROVADO}
               AND p.Data_Pagamento >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
             GROUP BY DATE_FORMAT(p.Data_Pagamento, '%Y-%m')
             ORDER BY mes ASC`,
            [intervalMonths],
        );
    }
}