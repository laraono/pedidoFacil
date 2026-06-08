import { DataSource, EntityManager, Repository, In, Not } from 'typeorm';
import { Comanda } from '../database/entity/Comanda';
import { Order } from '../database/entity/Order';
import { OrderStatus, ComandaStatus, DiscountType } from '../enum';
import { AppError } from '../middleware/error/AppError';
import { PaymentService } from './PaymentService';
import { ReceiptService } from './ReceiptService';
import { CreateComandaDTO } from '../dto/comanda/CreateComandaDTO';
import { CancelComandaDTO } from '../dto/comanda/CancelComandaDTO';
import { CheckoutComandaDTO } from '../dto/comanda/CheckoutComandaDTO';
import { getIO } from '../socket';

export class ComandaService {
  constructor(
    private dataSource: DataSource,
    private comandaRepository: Repository<Comanda>,
    private paymentService: PaymentService,
    private receiptService: ReceiptService,
  ) {}

  async getComanda(comandaId: number): Promise<Comanda | null> {
    return await this.comandaRepository.findOne({
      where: { id: comandaId },
    });
  }

  async createComanda(comandaData: CreateComandaDTO): Promise<Comanda> {
    const novaComanda = this.comandaRepository.create({
      ...comandaData,
      status: ComandaStatus.ABERTA,
      total: 0,
    } as Partial<Comanda>);

    return await this.comandaRepository.save(novaComanda);
  }

  async listComandas(establishmentId: number): Promise<Comanda[]> {
    return await this.dataSource
      .getRepository(Comanda)
      .createQueryBuilder('comanda')
      .leftJoinAndSelect('comanda.pedidos', 'pedido')
      .leftJoinAndSelect('pedido.productOrders', 'po')
      .leftJoinAndSelect('po.product', 'product')
      .leftJoinAndSelect('po.variations', 'variation')
      .leftJoinAndSelect('variation.productVariation', 'pv')
      .leftJoinAndSelect('pedido.paymentOrders', 'paymentOrders') 
      .leftJoinAndSelect('comanda.coupon', 'coupon') 
      .where('comanda.establishment = :id', { id: establishmentId })
      .getMany();
  }

  async listComandasByStatus(
    status: ComandaStatus,
    establishmentId: number,
  ): Promise<Comanda[]> {
    return await this.dataSource
      .getRepository(Comanda)
      .createQueryBuilder('comanda')
      .leftJoinAndSelect('comanda.pedidos', 'pedido')
      .leftJoinAndSelect('pedido.productOrders', 'po')
      .leftJoinAndSelect('po.product', 'product')
      .leftJoinAndSelect('po.variations', 'variation')
      .leftJoinAndSelect('variation.productVariation', 'pv')
      .leftJoinAndSelect('pedido.paymentOrders', 'paymentOrders') 
      .leftJoinAndSelect('comanda.coupon', 'coupon') 
      .where('comanda.status = :status', { status })
      .andWhere('comanda.establishment = :id', { id: establishmentId })
      .getMany();
  }

  async listComandasHistory(establishmentId: number): Promise<Comanda[]> {
    return await this.dataSource
      .getRepository(Comanda)
      .createQueryBuilder('comanda')
      .leftJoinAndSelect('comanda.pedidos', 'pedido')
      .leftJoinAndSelect('pedido.productOrders', 'po')
      .leftJoinAndSelect('po.product', 'product')
      .leftJoinAndSelect('po.variations', 'variation')
      .leftJoinAndSelect('variation.productVariation', 'pv')
      .leftJoinAndSelect('comanda.coupon', 'coupon') 
      .where('comanda.status IN (:...statuses)', {
        statuses: [ComandaStatus.FECHADA, ComandaStatus.CANCELADA],
      })
      .andWhere('comanda.establishment = :id', { id: establishmentId })
      .orderBy('comanda.created_at', 'DESC')
      .getMany();
  }

  async updateComandaStatus(
    comandaId: number,
    status: ComandaStatus,
  ): Promise<void> {
    const comanda = await this.comandaRepository.findOne({
      where: { id: comandaId },
    });
    if (!comanda) throw new AppError('Comanda não encontrada', 404);
    comanda.status = status;
    await this.comandaRepository.save(comanda);
  }

  async cancelComanda(data: CancelComandaDTO): Promise<void> {
    const comanda = await this.comandaRepository.findOne({
      where: { id: data.comandaId },
      relations: ['pedidos'],
    });
    if (!comanda) throw new AppError('Comanda não encontrada', 404);
    comanda.status = ComandaStatus.CANCELADA;
    await this.comandaRepository.save(comanda);

    if (comanda.pedidos && comanda.pedidos.length > 0) {
      for (const pedido of comanda.pedidos) {
        if (
          pedido.status !== OrderStatus.FINALIZADO &&
          pedido.status !== OrderStatus.CANCELADO
        ) {
          pedido.status = OrderStatus.CANCELADO;
          pedido.cancellationDescription =
            (data as any).reason || 'Comanda inteira cancelada na Cozinha';
          await this.dataSource.getRepository(Order).save(pedido);
        }
      }
    }
  }

  async updateComandaTotalTransaction(
    comanda: Comanda,
    valorAdicional: number,
    manager: EntityManager,
  ): Promise<void> {
    comanda.total = Number(comanda.total) + Number(valorAdicional);
    await manager.save(Comanda, comanda);
  }

  async processPartialPayment(
    comandaId: number,
    userId: number,
    establishmentId: number,
    paymentInput: { type: string; amount: number; terminal?: string },
    selectedOrderIds: number[],
    isLastPayment: boolean = true,
    cpfcnpj?: string,
    discountType?: string | null,  
    discountValue?: number | null, 
    couponId?: number | null       
  ) {
    let paymentId: number | null = null;

    const result = await this.dataSource.transaction(async (manager) => {
      const comanda = await manager.findOne(Comanda, {
        where: { id: comandaId, establishment: { id: establishmentId } },
      });

      if (!comanda) throw new AppError('Comanda não encontrada.', 404);
      if (comanda.status === ComandaStatus.FECHADA)
        throw new AppError('Comanda já fechada.', 400);

      const targetIds = selectedOrderIds.map(Number);

      const ordersToPay = await manager.find(Order, {
        where: {
          id: In(targetIds),
          comanda: { id: comandaId },
          status: Not(OrderStatus.CANCELADO),
        },
      });

      if (ordersToPay.length === 0)
        throw new AppError('Nenhum pedido válido selecionado para pagamento.', 400);

      const registeredPayment = await this.paymentService.processCheckoutPayments(
          comandaId, ordersToPay, [paymentInput], 0, establishmentId, userId, manager
      );

      paymentId = registeredPayment[0].id;
      if (discountValue !== undefined || discountType !== undefined || couponId !== undefined) {
          const partialUpdate: any = {};
          
          if (discountType !== undefined) partialUpdate.discountType = discountType;
          if (discountValue !== undefined) partialUpdate.discountValue = discountValue;
          if (couponId !== undefined) partialUpdate.coupon = couponId ? { id: couponId } : null;

          if (Object.keys(partialUpdate).length > 0) {
              await manager.update(Comanda, comandaId, partialUpdate as any);
          }
      }

      if (isLastPayment) {
        for (const p of ordersToPay) {
          if (p.status !== OrderStatus.FINALIZADO) {
            await manager.update(Order, p.id, { status: OrderStatus.FINALIZADO });
            getIO().to('cashier').emit('order_status_updated', { orderId: p.id, status: OrderStatus.FINALIZADO });
          }
        }

        const pendingOrders = await manager.count(Order, {
          where: {
            comanda: { id: comandaId },
            status: Not(In([OrderStatus.FINALIZADO, OrderStatus.CANCELADO])),
          },
        });

        if (pendingOrders === 0) {
          const currentComanda = await manager.findOne(Comanda, { where: { id: comandaId } });
          const finalDiscount = Number(currentComanda?.discountValue || discountValue || 0);
          const finalDiscountType = currentComanda?.discountType || discountType;
          
          let novoTotal = Number(currentComanda?.total || 0);

          if (finalDiscount > 0) {
            if (finalDiscountType === 'percent' || finalDiscountType === 'Percentual') {
              novoTotal = novoTotal * (1 - (finalDiscount / 100));
            } else {
              novoTotal = Math.max(0, novoTotal - finalDiscount);
            }
          }

          const comandaUpdateData: any = {
            status: ComandaStatus.FECHADA,
            total: novoTotal,
            discountType: finalDiscountType || null,
            discountValue: finalDiscount > 0 ? finalDiscount : null,
          };
          
          if (couponId !== undefined) {
             comandaUpdateData.coupon = couponId ? { id: couponId } : null;
          }

          await manager.update(Comanda, comandaId, comandaUpdateData as any);
        }
      }

      return { success: true, payment: registeredPayment[0] };
    });

    if (paymentId && isLastPayment) {
      try {
        await this.receiptService.generateReceipt(paymentId, establishmentId, cpfcnpj);
      } catch (error: any) {
        console.error('⚠️ [ComandaService] Erro ao gerar Nota Fiscal:', error.message);
      }
    }

    return result;
  }

  async checkoutComanda(
    comandaId: number,
    userId: number,
    establishmentId: number,
    checkoutData: CheckoutComandaDTO,
  ) {
    return { success: true };
  }
}