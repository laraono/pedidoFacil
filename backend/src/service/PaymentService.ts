import { DataSource, EntityManager } from 'typeorm';
import { Payment, PaymentOrder, Order } from '../database/entity';
import { PaymentMethod } from '../database/entity/PaymentMethod';
import { AppError } from '../middleware/error/AppError';
import { MercadoPagoService } from './MercadoPagoService';
import { OrderRepository, PaymentRepository } from '../repository';
import { PaymentStatus } from '../enum';
import { STATUS_PAGAMENTO_IDS } from '../database/entity/lookup-ids';

export class PaymentService {
    constructor(
        private dataSource: DataSource,
        private mercadoPagoService: MercadoPagoService,
        private paymentRepository: PaymentRepository,
        private orderRepository: OrderRepository,
    ) {}

    async processCheckoutPayments(
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

            // const terminal = paymentInput.type !== 'Dinheiro'
            //     ? (paymentInput.terminal ?? process.env.MERCADOPAGO_TERMINAL_ID ?? null)
            //     : null;
            // const hasRealTerminal = terminal && terminal !== 'seu_terminal_id_aqui';

            const paymentMethod = await manager.findOne(PaymentMethod, { where: { name: paymentInput.type } });
            if (!paymentMethod) throw new AppError(`Método de pagamento '${paymentInput.type}' não cadastrado.`, 400);

            const payment = manager.create(Payment, {
                paymentMethod,
                totalValue: paymentInput.amount,
                serviceTax: 0,
                change: paymentMethod.name === 'Dinheiro' ? remainingChange : 0,
                status: { id: STATUS_PAGAMENTO_IDS.APROVADO },
                establishment: { id: establishmentId },
                user: { id: userId }
            });

            const savedPayment = await manager.save(Payment, payment);

            // if(hasRealTerminal) {
            //     const answer = await this.processTerminalPayment({
            //         terminal: terminal!,
            //         amount: paymentInput.amount,
            //         orderId: savedPayment.id
            //     });

            //     await this.paymentRepository.saveMercadoPagoInfo(
            //         savedPayment.id,
            //         answer.id,
            //         answer.transactions.payments[0].id
            //     );
            // }

            registeredPayments.push(savedPayment);

            if (paymentMethod.name === 'Dinheiro') remainingChange = 0;

            let amountToDistribute = paymentInput.amount;

            for (const order of orders) {
                if (amountToDistribute <= 0) break;

                const paymentOrder = manager.create(PaymentOrder, {
                    orderId: order.id,
                    paymentId: savedPayment.id,
                    quantity: 1,
                    price: amountToDistribute
                });

                await manager.save(PaymentOrder, paymentOrder);
            }
        }

        return registeredPayments;
    }

    async listPayments(establishmentId: number, filters: any): Promise<Payment[]> {
        const paymentRepo = this.dataSource.getRepository(Payment);

        const query = paymentRepo.createQueryBuilder('payment')
            .leftJoinAndSelect('payment.status', 'ps')
            .leftJoinAndSelect('payment.user', 'user')
            .leftJoinAndSelect('payment.paymentMethod', 'paymentMethod')
            .leftJoinAndSelect('payment.paymentOrders', 'paymentOrders')
            .where('payment.establishment.id = :establishmentId', { establishmentId });

        if (filters.startDate && filters.endDate) {
            query.andWhere('payment.createdAt BETWEEN :startDate AND :endDate', {
                startDate: filters.startDate,
                endDate: filters.endDate
            });
        }

        if (filters.status) {
            query.andWhere('ps.nome = :status', { status: filters.status });
        }

        return await query.orderBy('payment.createdAt', 'DESC').getMany();
    }

    async getPaymentById(paymentId: number, establishmentId: number): Promise<Payment> {
        const paymentRepo = this.dataSource.getRepository(Payment);
        const payment = await paymentRepo.findOne({
            where: { id: paymentId, establishment: { id: establishmentId } },
            relations: ['status', 'user', 'paymentMethod', 'paymentOrders', 'paymentOrders.order']
        });

        if (!payment) throw new AppError('Pagamento não encontrado.', 404);
        return payment;
    }

    async refundPayment(paymentId: number, establishmentId: number, reason: string): Promise<Payment> {
        return await this.dataSource.transaction(async (manager) => {
            const payment = await manager.findOne(Payment, {
                where: { id: paymentId, establishment: { id: establishmentId } },
                relations: ['status'],
            });

            if (!payment) throw new AppError('Pagamento não encontrado.', 404);

            // if(payment.mercadoPagoOrderId) await this.mercadoPagoService.refundOrder(payment.mercadoPagoOrderId);

            if (payment.status?.nome === PaymentStatus.REFUNDED) throw new AppError('Pagamento já está estornado.', 400);

            payment.status = { id: STATUS_PAGAMENTO_IDS.ESTORNADO } as any;
            return await manager.save(Payment, payment);
        });
    }

    // async processTerminalPayment({amount, orderId, terminal}: {amount: number, orderId: number, terminal: string}) {
    //     const answer = await this.mercadoPagoService.createOrder({
    //         amount, orderId, terminal
    //     });
    //     return answer;
    // }
}
