import { DataSource, EntityManager } from 'typeorm';
import { Comanda } from '../database/entity/Comanda';
import { Order } from '../database/entity/Order';
import { StatusPedido } from '../database/entity/StatusPedido';
import { OrderStatus, ComandaStatus, DiscountType } from '../enum';
import { AppError } from '../middleware/error/AppError';
import { PaymentService } from './PaymentService';
import { ReceiptService } from './ReceiptService';
import { CreateComandaDTO } from '../dto/comanda/CreateComandaDTO';
import { CancelComandaDTO } from '../dto/comanda/CancelComandaDTO';
import { CheckoutComandaDTO } from '../dto/comanda/CheckoutComandaDTO';
import { getIO } from '../socket';
import {
  STATUS_COMANDA_IDS,
  STATUS_PEDIDO_IDS,
  TIPO_DESCONTO_IDS,
} from '../database/entity/lookup-ids';
import { ComandaRepository } from '../repository/ComandaRepository';

function resolveDiscountTypeFK(nome: string | null | undefined) {
  if (!nome) return null;
  if (nome === DiscountType.PERCENTUAL || nome === 'percent') return { id: TIPO_DESCONTO_IDS.PERCENTUAL };
  return { id: TIPO_DESCONTO_IDS.VALOR };
}

export class ComandaService {
  constructor(
    private dataSource: DataSource,
    private comandaRepository: ComandaRepository,
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
      status: { id: STATUS_COMANDA_IDS.ABERTA },
      total: 0,
    } as Partial<Comanda>);

    return await this.comandaRepository.save(novaComanda);
  }

  private comandaQB() {
    return this.dataSource
      .getRepository(Comanda)
      .createQueryBuilder('comanda')
      .leftJoinAndSelect('comanda.status', 'cs')
      .leftJoinAndSelect('comanda.discountType', 'dt')
      .leftJoinAndSelect('comanda.coupon', 'coupon')
      .leftJoinAndSelect('comanda.pedidos', 'pedido')
      .leftJoinAndSelect('pedido.status', 'ps')
      .leftJoinAndSelect('pedido.productOrders', 'po')
      .leftJoinAndSelect('po.product', 'product')
      .leftJoinAndSelect('po.productVariation', 'pv')
      .leftJoinAndSelect('pedido.paymentOrders', 'paymentOrders');
  }

  async listComandas(establishmentId: number): Promise<Comanda[]> {
    return await this.comandaQB()
      .where('comanda.establishment = :id', { id: establishmentId })
      .getMany();
  }

  async listComandasByStatus(
    status: ComandaStatus,
    establishmentId: number,
  ): Promise<Comanda[]> {
    return await this.comandaQB()
      .where('cs.nome = :status', { status })
      .andWhere('comanda.establishment = :id', { id: establishmentId })
      .getMany();
  }

  async listComandasHistory(establishmentId: number): Promise<Comanda[]> {
    return await this.comandaQB()
      .where('cs.nome IN (:...statuses)', { statuses: [ComandaStatus.FECHADA, ComandaStatus.CANCELADA] })
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
    await this.comandaRepository.updateComandaStatus(comandaId, status);
  }

  async cancelComanda(data: CancelComandaDTO): Promise<void> {
    const comanda = await this.comandaRepository.findOne({
      where: { id: data.comandaId },
      relations: ['pedidos', 'pedidos.status'],
    });
    if (!comanda) throw new AppError('Comanda não encontrada', 404);
    await this.comandaRepository.cancelComanda(data.comandaId);

    if (comanda.pedidos && comanda.pedidos.length > 0) {
      for (const pedido of comanda.pedidos) {
        if (
          pedido.status?.nome !== OrderStatus.FINALIZADO &&
          pedido.status?.nome !== OrderStatus.CANCELADO
        ) {
          pedido.status = { id: STATUS_PEDIDO_IDS.CANCELADO } as StatusPedido;
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
    couponId?: number | null,
  ) {
    let paymentId: number | null = null;

    const result = await this.dataSource.transaction(async (manager) => {
      const comanda = await manager.findOne(Comanda, {
        where: { id: comandaId, establishment: { id: establishmentId } },
        relations: ['status'],
      });

      if (!comanda) throw new AppError('Comanda não encontrada.', 404);
      if (
        comanda.status?.nome === ComandaStatus.FECHADA ||
        comanda.status?.nome === ComandaStatus.CANCELADA
      ) {
        throw new AppError('Comanda não está aberta.', 400);
      }

      const targetIds = selectedOrderIds.map(Number);

      const ordersToPay = await manager
        .createQueryBuilder(Order, 'o')
        .innerJoin('o.status', 'os')
        .where('o.id IN (:...ids)', { ids: targetIds })
        .andWhere('o.ID_Comanda = :comandaId', { comandaId })
        .andWhere('os.nome != :cancelado', { cancelado: OrderStatus.CANCELADO })
        .getMany();

      if (ordersToPay.length === 0)
        throw new AppError('Nenhum pedido válido selecionado para pagamento.', 400);

      const registeredPayment = await this.paymentService.processCheckoutPayments(
        ordersToPay, [paymentInput], 0, establishmentId, userId, manager,
      );

      paymentId = registeredPayment[0].id;

      if (discountValue !== undefined || discountType !== undefined || couponId !== undefined) {
        const partialUpdate: any = {};

        if (discountValue !== undefined || discountType !== undefined) {
          const hasDiscount =
            discountValue !== null && discountValue !== undefined && Number(discountValue) > 0;
          partialUpdate.discountValue = hasDiscount ? discountValue : null;
          partialUpdate.discountType = hasDiscount ? resolveDiscountTypeFK(discountType) : null;
        }
        if (couponId !== undefined) partialUpdate.coupon = couponId ? { id: couponId } : null;

        if (Object.keys(partialUpdate).length > 0) {
          await manager.update(Comanda, comandaId, partialUpdate as any);
        }
      }

      if (isLastPayment) {
        for (const p of ordersToPay) {
          if (p.status?.nome !== OrderStatus.FINALIZADO) {
            await manager.update(Order, p.id, {
              status: { id: STATUS_PEDIDO_IDS.FINALIZADO } as any,
            });
            getIO()
              .to('cashier')
              .emit('order_status_updated', { orderId: p.id, status: OrderStatus.FINALIZADO });
          }
        }

        const pendingOrders = await manager
          .createQueryBuilder(Order, 'o')
          .innerJoin('o.status', 'os')
          .innerJoin('o.comanda', 'c')
          .where('c.id = :comandaId', { comandaId })
          .andWhere('os.nome NOT IN (:...statuses)', {
            statuses: [OrderStatus.FINALIZADO, OrderStatus.CANCELADO],
          })
          .getCount();

        if (pendingOrders === 0) {
          const currentComanda = await manager.findOne(Comanda, {
            where: { id: comandaId },
            relations: ['discountType'],
          });
          const finalDiscount = Number(currentComanda?.discountValue || discountValue || 0);
          const finalDiscountTypeName = currentComanda?.discountType?.nome ?? discountType;

          let novoTotal = Number(currentComanda?.total || 0);

          if (finalDiscount > 0) {
            if (
              finalDiscountTypeName === 'percent' ||
              finalDiscountTypeName === DiscountType.PERCENTUAL
            ) {
              novoTotal = novoTotal * (1 - finalDiscount / 100);
            } else {
              novoTotal = Math.max(0, novoTotal - finalDiscount);
            }
          }

          const comandaUpdateData: any = {
            status: { id: STATUS_COMANDA_IDS.FECHADA },
            total: novoTotal,
            discountType: finalDiscount > 0 ? resolveDiscountTypeFK(finalDiscountTypeName) : null,
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
        console.error('[ComandaService] Erro ao gerar Nota Fiscal:', error.message);
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
