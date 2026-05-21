import { DataSource, EntityManager } from 'typeorm';
import { Payment, PaymentOrder, Order } from '../database/entity';
import { PaymentStatus } from '../database/entity/Payment';
import { AppError } from '../middleware/error/AppError';
import { MercadoPagoService } from './MercadoPagoService';
import { OrderRepository, PaymentRepository } from '../repository';
import { OrderStatus } from '../enum';
import { getIO } from '../socket';

export class PaymentService {
    constructor(
        private dataSource: DataSource,
        private mercadoPagoService: MercadoPagoService,
        private paymentRepository: PaymentRepository,
        private orderRepository: OrderRepository,
        ) {}

    async processCheckoutPayments(
        comandaId: number,
        orders: Order[],
        paymentsData: Array<{ type: string, amount: number, terminal?: string }>,
        change: number,
        establishmentId: number,
        userId: number,
        manager: EntityManager 
    ) {
        if (!orders || orders.length === 0) {
            throw new AppError('Não há pedidos válidos para pagamento nesta comanda.', 400);
        }

        const registeredPayments: Payment[] = []; 
        let remainingChange = change;

        for (const paymentInput of paymentsData) {

            const terminal = paymentInput.type !== 'Dinheiro'
                ? (paymentInput.terminal ?? process.env.MERCADOPAGO_TERMINAL_ID ?? null)
                : null;
            const hasRealTerminal = terminal && terminal !== 'seu_terminal_id_aqui';

            const payment = manager.create(Payment, {
                paymentType: paymentInput.type,
                totalValue: paymentInput.amount,
                serviceTax: 0,
                change: paymentInput.type === 'Dinheiro' ? remainingChange : 0,
                status: hasRealTerminal ? PaymentStatus.PENDING : PaymentStatus.PAID,
                establishment: { id: establishmentId },
                user: { id: userId }
            });

            const savedPayment = await manager.save(Payment, payment);

            if(hasRealTerminal) {
                const answer = await this.processTerminalPayment({
                    terminal: terminal!,
                    amount: paymentInput.amount,
                    orderId: savedPayment.id
                });

                await this.paymentRepository.saveMercadoPagoInfo(
                    savedPayment.id,
                    answer.id,
                    answer.transactions.payments[0].id
                );
            }

            registeredPayments.push(savedPayment);

            if (paymentInput.type === 'Dinheiro') remainingChange = 0; 

            let amountToDistribute = paymentInput.amount;

            for (const order of orders) {
                if (amountToDistribute <= 0) break;

                const paymentOrder = manager.create(PaymentOrder, {
                    orderId: order.id,
                    paymentId: savedPayment.id,
                    quantity: 1, 
                    price: amountToDistribute 
                });

                await this.orderRepository.updateOrderStatus(order.id, OrderStatus.FINALIZADO)
                getIO().to('cashier').emit('order_status_updated', {
                    orderId: order.id,
                    status: OrderStatus.FINALIZADO
                })

                await manager.save(PaymentOrder, paymentOrder);
            }
        }

        return registeredPayments;
    }
    
    async listPayments(establishmentId: number, filters: any): Promise<Payment[]> {
        const paymentRepo = this.dataSource.getRepository(Payment);
        
        const query = paymentRepo.createQueryBuilder('payment')
            .leftJoinAndSelect('payment.user', 'user')
            .leftJoinAndSelect('payment.paymentOrders', 'paymentOrders')
            .where('payment.establishment.id = :establishmentId', { establishmentId });

        if (filters.startDate && filters.endDate) {
            query.andWhere('payment.createdAt BETWEEN :startDate AND :endDate', {
                startDate: filters.startDate,
                endDate: filters.endDate
            });
        }

        if (filters.status) {
            query.andWhere('payment.status = :status', { status: filters.status });
        }

        return await query.orderBy('payment.createdAt', 'DESC').getMany();
    }

    async getPaymentById(paymentId: number, establishmentId: number): Promise<Payment> {
        const paymentRepo = this.dataSource.getRepository(Payment);
        const payment = await paymentRepo.findOne({
            where: { id: paymentId, establishment: { id: establishmentId } },
            relations: ['user', 'paymentOrders', 'paymentOrders.order']
        });

        if (!payment) {
            throw new AppError('Pagamento não encontrado.', 404);
        }

        return payment;
    }

    async refundPayment(paymentId: number, establishmentId: number, reason: string): Promise<Payment> {
        return await this.dataSource.transaction(async (manager) => {
            const payment = await manager.findOne(Payment, {
                where: { id: paymentId, establishment: { id: establishmentId } }
            });

            if (!payment) throw new AppError('Pagamento não encontrado.', 404);

            if(payment.mercadoPagoOrderId) await this.mercadoPagoService.refundOrder(payment.mercadoPagoOrderId)

            if (payment.status === PaymentStatus.REFUNDED) throw new AppError('Pagamento já está estornado.', 400);

            payment.status = PaymentStatus.REFUNDED;
                        
            return await manager.save(Payment, payment);
        });
    }

    async processTerminalPayment({amount, orderId, terminal}: {amount: number, orderId: number, terminal: string}) {
        const answer = await this.mercadoPagoService.createOrder({
            amount, orderId, terminal 
        })

        return answer
    }
}