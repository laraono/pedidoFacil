import { ReceiptRepository } from '../repository/ReceiptRepository';
import { MetricsRepository } from '../repository/MetricsRepository';
import { AppError } from '../middleware/error/AppError';

export class MetricsService {
    constructor(
        private receiptRepository: ReceiptRepository,
        private metricsRepository: MetricsRepository,
    ) {}

    async getReceiptMetrics(establishmentId: number, startDate: string, endDate: string) {
        if (!startDate || !endDate) {
            throw new AppError('Parâmetros de data (startDate e endDate) são obrigatórios.', 400);
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return this.receiptRepository.getMetrics(establishmentId, start, end);
    }

    async getDashboardOverview(establishmentId: number, startDate: string, endDate: string, filter: string) {
        if (!startDate || !endDate) {
            throw new AppError('Parâmetros de data são obrigatórios.', 400);
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const [kpisRaw, chartRaw, productsRaw, waitersRaw, paymentsRaw, channelsRaw, cancellationsRaw, peakHoursRaw, couponsRaw] = await Promise.all([
            this.metricsRepository.getKpis(establishmentId, start, end),
            this.metricsRepository.getChartData(establishmentId, start, end, filter),
            this.metricsRepository.getTopProducts(establishmentId, start, end),
            this.metricsRepository.getTopWaiters(establishmentId, start, end),
            this.metricsRepository.getPaymentMethods(establishmentId, start, end),
            this.metricsRepository.getSalesByChannel(establishmentId, start, end),
            this.metricsRepository.getCancellations(establishmentId, start, end),
            this.metricsRepository.getPeakHours(establishmentId, start, end),
            this.metricsRepository.getCouponUsage(establishmentId, start, end),
        ]);

        const faturamento = Number(kpisRaw.faturamentoTotal || 0);
        const totalComandas = Number(kpisRaw.totalComandas || 0);
        const ticketMedio = totalComandas > 0 ? faturamento / totalComandas : 0;

        const channelTotal = channelsRaw.reduce((sum: number, r: any) => sum + Number(r.count), 0);
        const salesByChannel = channelsRaw.map((r: any) => ({
            name: r.name,
            value: channelTotal > 0 ? Math.round((Number(r.count) / channelTotal) * 100) : 0,
        }));

        const maxPeak = Math.max(...peakHoursRaw.map((h: any) => Number(h.count)), 1);
        const peakHours = peakHoursRaw.map((h: any) => ({
            hora: h.hora,
            fluxo: Math.round((Number(h.count) / maxPeak) * 100),
        }));

        const cancellations = cancellationsRaw.map((c: any) => ({
            motivo: c.motivo,
            count: Number(c.count),
        }));
        const totalCancelados = cancellations.reduce((acc: number, c: any) => acc + c.count, 0);

        const paymentTotal = paymentsRaw.reduce((sum: number, r: any) => sum + Number(r.total), 0);
        const paymentMethods = paymentsRaw.map((r: any) => ({
            name: r.method,
            value: paymentTotal > 0 ? Math.round((Number(r.total) / paymentTotal) * 100) : 0,
        }));

        return {
            kpis: {
                faturamento,
                ticketMedio,
                giroMesa: totalComandas,
                cancelamentos: totalCancelados,
            },
            revenueData: chartRaw.map((d: any) => ({ label: d.label, value: Number(d.value) })),
            salesByChannel,
            peakHours,
            cancellations,
            topProducts: productsRaw.map((p: any, i: number) => ({
                id: i + 1,
                nome: p.nome,
                categoria: p.categoria || 'Geral',
                qtd: Number(p.qtd),
                receita: Number(p.receita),
            })),
            couponUsage: couponsRaw.map((c: any) => ({
                code: c.code,
                type: c.type,
                discount: Number(c.discount),
                uses: Number(c.uses),
            })),
            topWaiters: waitersRaw.map((w: any, i: number) => ({
                id: i + 1,
                name: w.name,
                orders: Number(w.orders),
                revenue: Number(w.revenue),
            })),
            paymentMethods,
        };
    }
}
