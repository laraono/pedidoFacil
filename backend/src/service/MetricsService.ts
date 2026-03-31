import { AppDataSource } from '../database/data-source';
import { Order } from '../database/entity/Order';
import { Between } from 'typeorm';
import { AppError } from '../middleware/error/AppError';

export class MetricsService {
    private orderRepository = AppDataSource.getRepository(Order);

    async getDashboardMetrics(establishmentId: number, startDate: string, endDate: string) {
        // Garantindo que a busca pegue desde as 00:00:00 do dia inicial até as 23:59:59 do dia final
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new AppError('Formato de data inválido. Utilize AAAA-MM-DD.', 400);
        }

        if (start > end) {
            throw new AppError('A data inicial não pode ser maior que a data final.', 400);
        }

        // Busca apenas os pedidos do estabelecimento específico dentro do período
        const orders = await this.orderRepository.find({
            where: {
                establishment: { id: establishmentId },
                created_at: Between(start, end)
            },
            relations: ['productOrders', 'productOrders.product']
        });

        let faturamentoTotal = 0;
        const productCount: Record<string, number> = {};

        // Processamento em memória (Backend trabalha, Frontend exibe)
        orders.forEach(order => {
            // Soma a taxa de entrega se houver
            if (order.tripPrice) {
                faturamentoTotal += Number(order.tripPrice);
            }

            if (order.productOrders) {
                order.productOrders.forEach(po => {
                    // 1. Contagem para o Top Produtos
                    if (po.product && po.product.name) {
                        const name = po.product.name;
                        // Forçamos o tipo para any para evitar erros caso o TypeScript 
                        // não reconheça as propriedades da entidade dinâmica no momento
                        const quantidade = Number((po as any).quantity || 1); 
                        productCount[name] = (productCount[name] || 0) + quantidade;
                    }

                    // 2. Cálculo do Faturamento
                    // Pega o preço no momento da compra salvo no ProductOrder
                    const preco = Number((po as any).price || 0);
                    const quantidadeItem = Number((po as any).quantity || 1);
                    
                    faturamentoTotal += preco * quantidadeItem;
                });
            }
        });

        const totalPedidos = orders.length;
        const ticketMedio = totalPedidos > 0 ? faturamentoTotal / totalPedidos : 0;

        // Transforma o objeto de contagem em array, ordena do mais vendido pro menos e pega o Top 5
        const topProdutos = Object.entries(productCount)
            .map(([nome, quantidade]) => ({ nome, quantidade }))
            .sort((a, b) => b.quantidade - a.quantidade)
            .slice(0, 5);

        return {
            periodo: { inicio: startDate, fim: endDate },
            resumo: {
                faturamentoTotal: Number(faturamentoTotal.toFixed(2)),
                totalPedidos,
                ticketMedio: Number(ticketMedio.toFixed(2)),
            },
            topProdutos
        };
    }
}