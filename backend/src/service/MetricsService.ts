import { Between, DataSource, IsNull, Not } from 'typeorm';
import { ReceiptRepository } from '../repository/ReceiptRepository';
import { ReceiptStatus } from '../database/entity/Receipt';
import { AppError } from '../middleware/error/AppError';
import { auditLog } from '../utils/logger';

export class MetricsService {
    constructor(
        private receiptRepository: ReceiptRepository,
        private dataSource: DataSource 
    ) {}

    async getReceiptMetrics(establishmentId: number, startDate: string, endDate: string) {
        if (!startDate || !endDate) {
            throw new AppError('Parâmetros de data (startDate e endDate) são obrigatórios.', 400);
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const dateFilter = Between(start, end);

        const emitidasCount = await this.receiptRepository.count({
            where: { 
                establishment: { id: establishmentId },
                status: ReceiptStatus.AUTORIZADA,
                createdAt: dateFilter
            }
        });

        const faturamento = await this.receiptRepository
            .createQueryBuilder("receipt")
            .select("SUM(receipt.totalValue)", "total")
            .innerJoin("receipt.establishment", "establishment")
            .where("establishment.id = :establishmentId", { establishmentId })
            .andWhere("receipt.status = :status", { status: ReceiptStatus.AUTORIZADA })
            .andWhere("receipt.createdAt BETWEEN :start AND :end", { start, end })
            .getRawOne();

        const comCpfCount = await this.receiptRepository.count({
            where: {
                establishment: { id: establishmentId },
                status: ReceiptStatus.AUTORIZADA,
                cpfcnpj: Not(IsNull()),
                createdAt: dateFilter
            }
        });

        const comErroCount = await this.receiptRepository.count({
            where: {
                establishment: { id: establishmentId },
                status: ReceiptStatus.ERRO,
                createdAt: dateFilter
            }
        });

        return {
            emitidas: emitidasCount,
            faturado: parseFloat(faturamento?.total || 0),
            comCpf: comCpfCount,
            comErro: comErroCount
        };
    }

    async getDashboardOverview(establishmentId: number, startDate: string, endDate: string, filter: string) {
        if (!startDate || !endDate) {
            throw new AppError('Parâmetros de data são obrigatórios.', 400);
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const kpisQuery = await this.dataSource.query(`
            SELECT COUNT(*) as totalComandas, SUM(c.Total) as faturamentoTotal
            FROM COMANDA c
            WHERE c.ID_Estabelecimento = ? AND c.Status = 'Fechada' AND c.Data_Abertura BETWEEN ? AND ?
        `, [establishmentId, start, end]);

        const faturamento = Number(kpisQuery[0].faturamentoTotal || 0);
        const totalComandas = Number(kpisQuery[0].totalComandas || 0);
        const ticketMedio = totalComandas > 0 ? faturamento / totalComandas : 0;

        let chartData = [];
        if (filter === '24h') {
            chartData = await this.dataSource.query(`
                SELECT DATE_FORMAT(Data_Abertura, '%H:00') as label, SUM(Total) as value
                FROM COMANDA
                WHERE ID_Estabelecimento = ? AND Status = 'Fechada' AND Data_Abertura BETWEEN ? AND ?
                GROUP BY DATE_FORMAT(Data_Abertura, '%H:00') 
                ORDER BY DATE_FORMAT(Data_Abertura, '%H:00')
            `, [establishmentId, start, end]);
        } else {
            chartData = await this.dataSource.query(`
                SELECT DATE_FORMAT(Data_Abertura, '%d/%m') as label, SUM(Total) as value
                FROM COMANDA
                WHERE ID_Estabelecimento = ? AND Status = 'Fechada' AND Data_Abertura BETWEEN ? AND ?
                GROUP BY DATE_FORMAT(Data_Abertura, '%d/%m') 
                ORDER BY MIN(Data_Abertura)
            `, [establishmentId, start, end]);
        }

        const channelsQuery = await this.dataSource.query(`
            SELECT p.Tipo_Atendimento as name, COUNT(*) as count
            FROM PEDIDO p INNER JOIN COMANDA c ON p.ID_Comanda = c.ID_Comanda
            WHERE c.ID_Estabelecimento = ? AND p.Data_Hora_Chegada BETWEEN ? AND ?
            GROUP BY p.Tipo_Atendimento
        `, [establishmentId, start, end]);

        const totalPedidos = channelsQuery.reduce((sum: number, row: any) => sum + Number(row.count), 0);
        const salesByChannel = channelsQuery.map((row: any) => {
            const perc = totalPedidos > 0 ? (Number(row.count) / totalPedidos) * 100 : 0;
            let color = row.name === 'Autoatendimento' ? 'bg-accent' : row.name === 'Garçom' ? 'bg-blue-500' : 'bg-brand-green';
            return { name: row.name, value: Math.round(perc), color };
        });

        const peakHoursQuery = await this.dataSource.query(`
            SELECT DATE_FORMAT(Data_Abertura, '%H:00') as hora, COUNT(*) as count
            FROM COMANDA
            WHERE ID_Estabelecimento = ? AND Data_Abertura BETWEEN ? AND ?
            GROUP BY DATE_FORMAT(Data_Abertura, '%H:00') 
            ORDER BY DATE_FORMAT(Data_Abertura, '%H:00')
        `, [establishmentId, start, end]);
        const maxPeak = Math.max(...peakHoursQuery.map((h: any) => Number(h.count)), 1);
        const peakHours = peakHoursQuery.map((h: any) => ({ hora: h.hora, fluxo: Math.round((Number(h.count) / maxPeak) * 100) }));

        const cancelamentosQuery = await this.dataSource.query(`
            SELECT COALESCE(Cancelamento_Descricao, 'Sem motivo informado') as motivo, COUNT(*) as count 
            FROM PEDIDO p INNER JOIN COMANDA c ON p.ID_Comanda = c.ID_Comanda
            WHERE c.ID_Estabelecimento = ? AND p.Status = 'Cancelado' AND p.Data_Hora_Chegada BETWEEN ? AND ?
            GROUP BY Cancelamento_Descricao ORDER BY count DESC
        `, [establishmentId, start, end]);
        
        const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-red-400'];
        const cancellations = cancelamentosQuery.map((c: any, index: number) => ({
            motivo: c.motivo, count: Number(c.count), color: colors[index % colors.length]
        }));
        const totalCancelados = cancellations.reduce((acc: number, curr: any) => acc + curr.count, 0);
        
        let topProducts = [];
        try {
            const prodQuery = await this.dataSource.query(`
                SELECT pr.Nome as nome, c.Nome as categoria, SUM(pp.Quantidade) as qtd, SUM(pp.Quantidade * pp.Preco_Unitario_Momento) as receita
                FROM ItemPedido pp
                INNER JOIN PEDIDO p ON pp.ID_Pedido = p.ID_Pedido
                INNER JOIN PRODUTO pr ON pp.ID_Produto = pr.ID_Produto
                LEFT JOIN CATEGORIA c ON pr.ID_Categoria = c.ID_Categoria
                WHERE p.ID_Estabelecimento = ? AND p.Status != 'Cancelado' AND p.Data_Hora_Chegada BETWEEN ? AND ?
                GROUP BY pr.ID_Produto 
                ORDER BY qtd DESC LIMIT 5
            `, [establishmentId, start, end]);

            topProducts = prodQuery.map((p: any) => ({
                nome: p.nome, categoria: p.categoria || 'Geral', qtd: Number(p.qtd),
                receita: `R$ ${Number(p.receita).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, margem: '65%' 
            }));
        } catch (e: any) { auditLog('metrics.query_error', { aba: 'produtos', error: e.message }); }
        
        let couponUsage = [];
        try {
            const coupQuery = await this.dataSource.query(`
                SELECT cup.Codigo as code, cup.Tipo_Desconto as type, cup.Valor_Desconto as discount, COUNT(c.ID_Comanda) as uses
                FROM COMANDA c 
                INNER JOIN CUPOM_DESCONTO cup ON c.ID_Cupom_Aplicado = cup.ID_Cupom
                WHERE c.ID_Estabelecimento = ? AND c.Status = 'Fechada' AND c.Data_Abertura BETWEEN ? AND ?
                GROUP BY cup.ID_Cupom 
                ORDER BY uses DESC
            `, [establishmentId, start, end]);

            couponUsage = coupQuery.map((c: any) => ({ code: c.code, type: c.type, discount: Number(c.discount), uses: Number(c.uses) }));
        } catch (e: any) { auditLog('metrics.query_error', { aba: 'cupons', error: e.message }); }

        let topWaiters = [];
        try {
            const waitQuery = await this.dataSource.query(`
                SELECT u.Nome as name, COUNT(c.ID_Comanda) as orders, SUM(c.Total) as revenue
                FROM COMANDA c 
                INNER JOIN USUARIO u ON c.ID_Usuario_Abertura = u.ID_Usuario
                WHERE c.ID_Estabelecimento = ? AND c.Status = 'Fechada' AND c.Data_Abertura BETWEEN ? AND ?
                GROUP BY u.ID_Usuario 
                ORDER BY revenue DESC LIMIT 5
            `, [establishmentId, start, end]);

            topWaiters = waitQuery.map((w: any, idx: number) => ({
                id: idx + 1, name: w.name, orders: Number(w.orders),
                revenue: `R$ ${Number(w.revenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            }));
        } catch (e: any) { auditLog('metrics.query_error', { aba: 'operacional', error: e.message }); }

        let paymentMethods = [];
        try {
            const payQuery = await this.dataSource.query(`
                SELECT Forma_Pagamento as method, SUM(Valor_Total) as total
                FROM PAGAMENTO
                WHERE ID_Estabelecimento = ? 
                  AND Status = 'Aprovado' 
                  AND Data_Hora_Pagamento BETWEEN ? AND ?
                GROUP BY Forma_Pagamento
                ORDER BY total DESC
            `, [establishmentId, start, end]);

            const totalPayments = payQuery.reduce((sum: number, row: any) => sum + Number(row.total), 0);

            paymentMethods = payQuery.map((row: any) => {
                const perc = totalPayments > 0 ? (Number(row.total) / totalPayments) * 100 : 0;
                
                let color = 'bg-gray-400';
                const methodLower = row.method.toLowerCase();
                
                if (methodLower.includes('pix')) color = 'bg-teal-400';
                else if (methodLower.includes('crédito') || methodLower.includes('credito')) color = 'bg-blue-500';
                else if (methodLower.includes('débito') || methodLower.includes('debito')) color = 'bg-indigo-400';
                else if (methodLower.includes('dinheiro')) color = 'bg-green-500';
                else if (methodLower.includes('cart')) color = 'bg-blue-500';

                return {
                    name: row.method,
                    value: Math.round(perc),
                    color
                };
            });
        } catch (e: any) { 
            auditLog('metrics.query_error', { aba: 'financeira', error: e.message });
        }

        return {
            kpis: {
                faturamento: `R$ ${faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                ticketMedio: `R$ ${ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                giroMesa: totalComandas.toString(), 
                cancelamentos: totalCancelados.toString()
            },
            revenueData: chartData.map((d: any) => ({ label: d.label, value: Number(d.value) })),
            salesByChannel, peakHours, cancellations, topProducts, couponUsage, topWaiters, paymentMethods
        };
    }
}