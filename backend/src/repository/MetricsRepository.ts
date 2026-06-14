import { DataSource } from 'typeorm';
import { auditLog } from '../utils/logger';
import {
    STATUS_COMANDA_IDS,
    STATUS_PEDIDO_IDS,
    STATUS_PAGAMENTO_IDS,
} from '../database/entity/lookup-ids';

const SC_FECHADA   = STATUS_COMANDA_IDS.FECHADA;
const SP_CANCELADO = STATUS_PEDIDO_IDS.CANCELADO;
const SPG_APROVADO = STATUS_PAGAMENTO_IDS.APROVADO;

export class MetricsRepository {
    constructor(private dataSource: DataSource) {}

    async getKpis(establishmentId: number, start: Date, end: Date) {
        const rows = await this.dataSource.query(`
            SELECT COUNT(*) as totalComandas, SUM(c.Total) as faturamentoTotal
            FROM COMANDA c
            WHERE c.ID_Estabelecimento = ? AND c.ID_Status = ${SC_FECHADA} AND c.Data_Abertura BETWEEN ? AND ?
        `, [establishmentId, start, end]);
        return rows[0];
    }

    async getChartData(establishmentId: number, start: Date, end: Date, filter: string) {
        const sql = filter === '24h'
            ? `SELECT DATE_FORMAT(Data_Abertura, '%H:00') as label, SUM(Total) as value
               FROM COMANDA WHERE ID_Estabelecimento = ? AND ID_Status = ${SC_FECHADA} AND Data_Abertura BETWEEN ? AND ?
               GROUP BY DATE_FORMAT(Data_Abertura, '%H:00') ORDER BY DATE_FORMAT(Data_Abertura, '%H:00')`
            : `SELECT DATE_FORMAT(Data_Abertura, '%d/%m') as label, SUM(Total) as value
               FROM COMANDA WHERE ID_Estabelecimento = ? AND ID_Status = ${SC_FECHADA} AND Data_Abertura BETWEEN ? AND ?
               GROUP BY DATE_FORMAT(Data_Abertura, '%d/%m') ORDER BY MIN(Data_Abertura)`;
        return this.dataSource.query(sql, [establishmentId, start, end]);
    }

    async getTopProducts(establishmentId: number, start: Date, end: Date) {
        return this.dataSource.query(`
            SELECT pr.Nome as nome, cat.Nome as categoria,
                   SUM(pp.Quantidade) as qtd,
                   SUM(pp.Quantidade * pp.Preco_Unitario_Momento) as receita
            FROM ITEM_PEDIDO pp
            INNER JOIN PEDIDO p ON pp.ID_Pedido = p.ID_Pedido
            INNER JOIN COMANDA cmd ON p.ID_Comanda = cmd.ID_Comanda
            INNER JOIN PRODUTO pr ON pp.ID_Produto = pr.ID_Produto
            LEFT JOIN CATEGORIA cat ON pr.ID_Categoria = cat.ID_Categoria
            WHERE cmd.ID_Estabelecimento = ? AND p.ID_Status != ${SP_CANCELADO} AND p.Data_Hora_Chegada BETWEEN ? AND ?
            GROUP BY pr.ID_Produto
            ORDER BY qtd DESC LIMIT 5
        `, [establishmentId, start, end]).catch((e: any) => {
            auditLog('metrics.query_error', { aba: 'produtos', error: e.message });
            return [];
        });
    }

    async getCouponUsage(establishmentId: number, start: Date, end: Date) {
        return this.dataSource.query(`
            SELECT cup.Codigo as code, td.Nome as type, cup.Valor_Desconto as discount, COUNT(cmd.ID_Comanda) as uses
            FROM COMANDA cmd
            INNER JOIN CUPOM_DESCONTO cup ON cmd.ID_Cupom_Aplicado = cup.ID_Cupom
            INNER JOIN TIPO_DESCONTO td ON cup.ID_TipoDesconto = td.ID_TipoDesconto
            WHERE cmd.ID_Estabelecimento = ? AND cmd.ID_Status = ${SC_FECHADA} AND cmd.Data_Abertura BETWEEN ? AND ?
            GROUP BY cup.ID_Cupom
            ORDER BY uses DESC
        `, [establishmentId, start, end]).catch((e: any) => {
            auditLog('metrics.query_error', { aba: 'cupons', error: e.message });
            return [];
        });
    }

    async getTopWaiters(establishmentId: number, start: Date, end: Date) {
        return this.dataSource.query(`
            SELECT u.Nome as name, COUNT(c.ID_Comanda) as orders, SUM(c.Total) as revenue
            FROM COMANDA c
            INNER JOIN USUARIO u ON c.ID_Usuario_Abertura = u.ID_Usuario
            WHERE c.ID_Estabelecimento = ? AND c.ID_Status = ${SC_FECHADA} AND c.Data_Abertura BETWEEN ? AND ?
            GROUP BY u.ID_Usuario
            ORDER BY revenue DESC LIMIT 5
        `, [establishmentId, start, end]).catch((e: any) => {
            auditLog('metrics.query_error', { aba: 'operacional', error: e.message });
            return [];
        });
    }

    async getPaymentMethods(establishmentId: number, start: Date, end: Date) {
        return this.dataSource.query(`
            SELECT mp.Nome as method, SUM(pagped.Valor_Pago_Deste_Pedido) as total
            FROM COMANDA c
            INNER JOIN PEDIDO pe ON pe.ID_Comanda = c.ID_Comanda
            INNER JOIN PAGAMENTO_PEDIDO pagped ON pagped.ID_Pedido = pe.ID_Pedido
            INNER JOIN PAGAMENTO p ON p.ID_Pagamento = pagped.ID_Pagamento
            INNER JOIN METODO_PAGAMENTO mp ON mp.ID_MetodoPagamento = p.ID_MetodoPagamento
            WHERE c.ID_Estabelecimento = ?
              AND c.ID_Status = ${SC_FECHADA}
              AND c.Data_Abertura BETWEEN ? AND ?
              AND p.ID_Status = ${SPG_APROVADO}
            GROUP BY mp.Nome
            ORDER BY total DESC
        `, [establishmentId, start, end]).catch((e: any) => {
            auditLog('metrics.query_error', { aba: 'financeira', error: e.message });
            return [];
        });
    }

    async getSalesByChannel(establishmentId: number, start: Date, end: Date) {
        return this.dataSource.query(`
            SELECT CASE WHEN p.Autoatendimento = 1 THEN 'Autoatendimento' ELSE 'Garcom' END as name,
                   COUNT(*) as count
            FROM PEDIDO p INNER JOIN COMANDA c ON p.ID_Comanda = c.ID_Comanda
            WHERE c.ID_Estabelecimento = ? AND p.Data_Hora_Chegada BETWEEN ? AND ?
            GROUP BY p.Autoatendimento
        `, [establishmentId, start, end]);
    }

    async getCancellations(establishmentId: number, start: Date, end: Date) {
        return this.dataSource.query(`
            SELECT COALESCE(Cancelamento_Descricao, 'Sem motivo informado') as motivo, COUNT(*) as count
            FROM PEDIDO p INNER JOIN COMANDA c ON p.ID_Comanda = c.ID_Comanda
            WHERE c.ID_Estabelecimento = ? AND p.ID_Status = ${SP_CANCELADO} AND p.Data_Hora_Chegada BETWEEN ? AND ?
            GROUP BY Cancelamento_Descricao ORDER BY count DESC
        `, [establishmentId, start, end]);
    }

    async getPeakHours(establishmentId: number, start: Date, end: Date) {
        return this.dataSource.query(`
            SELECT DATE_FORMAT(Data_Abertura, '%H:00') as hora, COUNT(*) as count
            FROM COMANDA
            WHERE ID_Estabelecimento = ? AND Data_Abertura BETWEEN ? AND ?
            GROUP BY DATE_FORMAT(Data_Abertura, '%H:00')
            ORDER BY DATE_FORMAT(Data_Abertura, '%H:00')
        `, [establishmentId, start, end]);
    }
}
