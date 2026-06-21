import { DataSource, EntityManager } from 'typeorm';
import {
  Order,
  Product,
  ProductOrder,
  ProductVariation,
  Comanda,
} from '../database';
import { OrderStatus, ComandaStatus } from '../enum';
import { AppError } from '../middleware';
import { OrderRepository } from '../repository';
import { ComandaService } from './ComandaService';
import { STATUS_COMANDA_IDS, STATUS_PEDIDO_IDS } from '../database/entity/lookup-ids';
import { getIO } from '../socket';

const ORDER_STATUS_ID: Record<OrderStatus, number> = {
  [OrderStatus.AGUARDANDO_PREPARO]: STATUS_PEDIDO_IDS.AGUARDANDO_PREPARO,
  [OrderStatus.EM_PREPARO]:         STATUS_PEDIDO_IDS.EM_PREPARO,
  [OrderStatus.PRONTO]:             STATUS_PEDIDO_IDS.PRONTO,
  [OrderStatus.FINALIZADO]:         STATUS_PEDIDO_IDS.FINALIZADO,
  [OrderStatus.CANCELADO]:          STATUS_PEDIDO_IDS.CANCELADO,
};

export class OrderService {
  private dataSource: DataSource;
  private orderRepository: OrderRepository;
  private comandaService: ComandaService;

  constructor(
    dataSource: DataSource,
    orderRepository: OrderRepository,
    comandaService: ComandaService,
  ) {
    this.dataSource = dataSource;
    this.orderRepository = orderRepository;
    this.comandaService = comandaService;
  }

  private buildMappedItems(fullOrder: any) {
    return fullOrder?.productOrders?.map((po: any) => ({
      name: po.product?.name || 'Produto',
      variationName: po.productVariation?.name || '',
      quantity: po.quantity,
      observation: po.observation,
    })) ?? [];
  }

  async createOrder(data: any) {
    if (data.clientRequestId) {
      const existing = await this.dataSource.getRepository(Order).findOne({
        where: { clientRequestId: data.clientRequestId },
      });
      if (existing) return existing;
    }

    const comanda = await this.comandaService.getComanda(data.comandaId);
    if (!comanda) throw new AppError('Comanda não encontrada', 404);

    const order = await this.createOrderWithTransaction(data, comanda) as any;

    const comandaLabel = data.comandaLabel || `Comanda #${data.comandaId}`;
    const fullOrder = await this.getOrderWithDetails(order.id);
    const items = this.buildMappedItems(fullOrder);

    getIO().to(`kitchen_${data.establishmentId}`).emit('new_order', {
      orderId:      order.id,
      comandaId:    Number(data.comandaId),
      comandaLabel,
      items,
      createdAt:    fullOrder?.created_at ? new Date(fullOrder.created_at).toISOString() : new Date().toISOString(),
      source:       data.source || 'web',
      userId:       data.userId,
      user:         { id: data.userId },
    });

    return order;
  }

  async createOrderWithTransaction(createOrder: any, comanda: any) {
    const MAX_RETRIES = 3;

    for (let attempt = 1; ; attempt++) {
      try {
        return await this.dataSource.transaction(async (manager) => {
          // pedidos concorrentes na mesma comanda entram em fila
          await manager.findOne(Comanda, {
            where: { id: comanda.id },
            lock: { mode: 'pessimistic_write' },
          });

          const statusId = (createOrder.status && ORDER_STATUS_ID[createOrder.status as OrderStatus])
            ?? STATUS_PEDIDO_IDS.AGUARDANDO_PREPARO;

          const order = await manager.save(Order, {
            status: { id: statusId },
            autoatendimento: createOrder.autoatendimento ?? false,
            comanda: comanda,
            createdBy: createOrder.userId ? { id: createOrder.userId } : undefined,
            clientRequestId: createOrder.clientRequestId ?? null,
          }) as any;

          await this.saveItens(createOrder.itens, order, manager);

          return order;
        });
      } catch (err: any) {
        const code = err?.code || err?.driverError?.code;
        if ((code === 'ER_LOCK_DEADLOCK' || code === 'ER_LOCK_WAIT_TIMEOUT') && attempt < MAX_RETRIES) {
          continue;
        }
        throw err;
      }
    }
  }

  async createTotemOrder(data: any) {
    const order = await this.dataSource.transaction(async (manager) => {
      const comanda = await manager.save(Comanda, {
        description: data.comandaLabel,
        status: { id: STATUS_COMANDA_IDS.ABERTA },
        total: 0,
        establishment: { id: data.establishmentId },
      }) as Comanda;

      const savedOrder = await manager.save(Order, {
        status: { id: STATUS_PEDIDO_IDS.AGUARDANDO_PREPARO },
        autoatendimento: true,
        comanda: comanda,
      }) as Order;

      await this.saveItens(data.itens, savedOrder, manager);

      savedOrder.comanda = comanda;
      return savedOrder;
    }) as any;

    const fullOrder = await this.getOrderWithDetails(order.id);
    const items = this.buildMappedItems(fullOrder);

    getIO().to(`kitchen_${data.establishmentId}`).emit('new_order', {
      orderId:      order.id,
      comandaId:    order.comanda.id,
      comandaLabel: data.comandaLabel,
      items,
      createdAt:    fullOrder?.created_at ? new Date(fullOrder.created_at).toISOString() : new Date().toISOString(),
      source:       'totem',
      userId:       null,
      user:         null,
    });

    return order;
  }

  async saveItens(itens: any[], order: Order, manager: EntityManager) {
    let totalAcumulado = 0;

    for (const iten of itens) {
      const validated = await this.validateItens(iten, manager);

      const finalPrice = validated.productVariation
        ? Number(validated.productVariation.addPrice)
        : Number(validated.product.basePrice);

      totalAcumulado += finalPrice * iten.quantity;

      await manager.save(ProductOrder, {
        order: { id: order.id },
        product: { id: validated.product.id },
        productVariationId: validated.productVariation?.id ?? null,
        observation: iten.observation || '',
        quantity: iten.quantity,
        price: finalPrice,
      });
    }

    await this.comandaService.updateComandaTotalTransaction(
      order.comanda,
      totalAcumulado,
      manager,
    );
  }

  async validateItens(iten: any, manager: EntityManager) {
    const product = await manager.findOne(Product, {
      where: { id: iten.productId },
    });

    if (!product) throw new AppError(`Produto ${iten.productId} não existe`, 400);

    let productVariation: ProductVariation | null = null;

    if (iten.productVariationId) {
      productVariation = await manager.findOne(ProductVariation, {
        where: { id: iten.productVariationId },
      });
    }

    return { product, productVariation };
  }

  async listOrders(establishmentId: number) {
    return await this.orderRepository.listOrders(establishmentId);
  }

  async listOrdersByComanda(comandaId: number) {
    return await this.orderRepository.listOrdersByComanda(comandaId);
  }

  async updateOrderStatus(
    orderId: number,
    status: OrderStatus,
    userId?: number,
    reason?: string,
    expectedComandaId?: number,
    establishmentId?: number,
  ) {
    const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.AGUARDANDO_PREPARO]: [OrderStatus.EM_PREPARO, OrderStatus.CANCELADO],
      [OrderStatus.EM_PREPARO]:         [OrderStatus.PRONTO, OrderStatus.CANCELADO],
      [OrderStatus.PRONTO]:             [OrderStatus.FINALIZADO],
      [OrderStatus.FINALIZADO]:         [],
      [OrderStatus.CANCELADO]:          [],
    };

    const order = await this.dataSource.getRepository(Order).findOne({
      where: { id: orderId },
      relations: ['comanda', 'createdBy', 'status', 'productOrders'],
    });

    if (!order) throw new AppError('Pedido não encontrado', 404);
    if (!order.comanda) throw new AppError('Pedido sem comanda associada', 500);
    if (expectedComandaId && order.comanda.id !== expectedComandaId)
      throw new AppError('Pedido não pertence a esta comanda', 403);

    const currentStatus = order.status?.nome as OrderStatus;
    if (!ALLOWED_TRANSITIONS[currentStatus]?.includes(status))
      throw new AppError(`Transição inválida: ${currentStatus} → ${status}`, 422);

    const orderUserId = order?.createdBy?.id;
    const comandaId = order.comanda.id;

    const updateData: any = { status: { id: ORDER_STATUS_ID[status] } };

    if (status === OrderStatus.CANCELADO) {
      if (userId) updateData.user = { id: userId };
      if (reason) updateData.cancellationDescription = reason;
    }

    await this.orderRepository.update(orderId, updateData);

    const io = getIO();

    if (status === OrderStatus.CANCELADO) {
      const orderValue = order.productOrders?.reduce(
        (sum, po) => sum + Number(po.price) * po.quantity, 0,
      ) ?? 0;
      if (orderValue > 0) {
        await this.comandaService.decrementComandaTotal(comandaId, orderValue);
      }

      if (establishmentId) {
        io.to(`kitchen_${establishmentId}`).to(`cashier_${establishmentId}`).emit('order_cancelled', {
          orderId,
          comandaId,
        });
      }

      const remaining = await this.dataSource
        .getRepository(Order)
        .createQueryBuilder('o')
        .innerJoin('o.status', 's')
        .where('o.comanda = :comandaId', { comandaId })
        .andWhere('s.nome != :cancelado', { cancelado: OrderStatus.CANCELADO })
        .getCount();

      if (remaining === 0) {
        await this.comandaService.updateComandaStatus(comandaId, ComandaStatus.CANCELADA);
        if (establishmentId) {
          io.to(`kitchen_${establishmentId}`).to(`cashier_${establishmentId}`).emit('comanda_cancelled', { comandaId });
        }
        return { comandaCancelled: true, comandaId, orderUserId, comandaLabel: order.comanda.description };
      }
    } else {
      if (establishmentId) {
        io.to(`kitchen_${establishmentId}`).to(`cashier_${establishmentId}`).to(`waiter_${establishmentId}`).emit('order_status_updated', {
          orderId,
          comandaId,
          status,
        });
      }
      if (status === OrderStatus.PRONTO && orderUserId) {
        io.emit(`user_notification_${orderUserId}`, {
          orderId,
          comanda: order.comanda.description,
        });
      }
    }

    return { comandaCancelled: false, comandaId, orderUserId, comandaLabel: order.comanda.description };
  }

  async getOrderWithDetails(orderId: number) {
    return await this.dataSource.getRepository(Order)
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.status', 'os')
      .leftJoinAndSelect('order.productOrders', 'po')
      .leftJoinAndSelect('po.product', 'product')
      .leftJoinAndSelect('po.productVariation', 'pv')
      .where('order.id = :id', { id: orderId })
      .getOne();
  }
}
