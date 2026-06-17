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

  async createOrder(data: any) {
    const comanda = await this.comandaService.getComanda(data.comandaId);
    if (!comanda) throw new AppError('Comanda não encontrada', 404);

    return await this.createOrderWithTransaction(data, comanda);
  }

  async createOrderWithTransaction(createOrder: any, comanda: any) {
    return await this.dataSource.transaction(async (manager) => {
      const statusId = (createOrder.status && ORDER_STATUS_ID[createOrder.status as OrderStatus])
        ?? STATUS_PEDIDO_IDS.AGUARDANDO_PREPARO;

      const order = await manager.save(Order, {
        status: { id: statusId },
        autoatendimento: createOrder.autoatendimento ?? false,
        comanda: comanda,
        createdBy: createOrder.userId ? { id: createOrder.userId } : undefined,
      }) as any;

      await this.saveItens(createOrder.itens, order, manager);

      return order;
    });
  }

  async createTotemOrder(data: any) {
    return await this.dataSource.transaction(async (manager) => {
      const comanda = await manager.save(Comanda, {
        description: data.comandaLabel,
        status: { id: STATUS_COMANDA_IDS.ABERTA },
        total: 0,
        establishment: { id: data.establishmentId },
      }) as Comanda;

      const order = await manager.save(Order, {
        status: { id: STATUS_PEDIDO_IDS.AGUARDANDO_PREPARO },
        autoatendimento: true,
        comanda: comanda,
      }) as Order;

      await this.saveItens(data.itens, order, manager);

      order.comanda = comanda;
      return order;
    });
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
      lock: { mode: 'pessimistic_write' },
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
  ) {
    const order = await this.dataSource.getRepository(Order).findOne({
      where: { id: orderId },
      relations: ['comanda', 'createdBy', 'status'],
    });

    if (!order) throw new AppError('Pedido não encontrado', 404);
    if (!order.comanda) throw new AppError('Pedido sem comanda associada', 500);
    if (expectedComandaId && order.comanda.id !== expectedComandaId)
      throw new AppError('Pedido não pertence a esta comanda', 403);

    const orderUserId = order?.createdBy?.id;

    const updateData: any = { status: { id: ORDER_STATUS_ID[status] } };

    if (status === OrderStatus.CANCELADO) {
      if (userId) updateData.user = { id: userId };
      if (reason) updateData.cancellationDescription = reason;
    }

    await this.orderRepository.update(orderId, updateData);

    const comandaId = order.comanda.id;

    if (status === OrderStatus.CANCELADO) {
      const allOrders = await this.dataSource.getRepository(Order).find({
        where: { comanda: { id: comandaId } },
        relations: ['status'],
      });
      const allCancelled =
        allOrders.length > 0 &&
        allOrders.every(o => o.status?.nome === OrderStatus.CANCELADO);

      if (allCancelled) {
        await this.comandaService.updateComandaStatus(comandaId, ComandaStatus.CANCELADA);
        return { comandaCancelled: true, comandaId, orderUserId, comandaLabel: order.comanda.description };
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