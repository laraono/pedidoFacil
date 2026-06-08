import { DataSource, EntityManager } from 'typeorm';
import {
  Order,
  Product,
  ProductOrder,
  ProductVariation,
  ProductVariationOrder,
  Comanda,
} from '../database';
import { OrderStatus, ComandaStatus, ServiceType } from '../enum';
import { AppError } from '../middleware';
import { OrderRepository } from '../repository';
import { ComandaService } from './ComandaService';

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
      const order = await manager.save(Order, {
        status: createOrder.status,
        serviceType: createOrder.serviceType,
        comanda: comanda,
        establishment: { id: createOrder.establishmentId },
        user: createOrder.userId ? { id: createOrder.userId } : undefined,
        isDelivered: false,
      }) as any;

      await this.saveItens(createOrder.itens, order, manager);

      return order;
    });
  }

  async createTotemOrder(data: any) {
    return await this.dataSource.transaction(async (manager) => {
      const comanda = await manager.save(Comanda, {
        description: data.comandaLabel,
        customerName: data.customerName ?? null,
        status: ComandaStatus.ABERTA,
        total: 0,
        establishment: { id: data.establishmentId },
      }) as Comanda;

      const order = await manager.save(Order, {
        status: 'Aguardando_Preparo' as OrderStatus,
        serviceType: ServiceType.AUTOATENDIMENTO,
        comanda: comanda,
        establishment: { id: data.establishmentId },
        isDelivered: false,
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

      const basePrice = Number(validated.product.basePrice);
      const addPrice = validated.productVariation
        ? Number(validated.productVariation.addPrice)
        : 0;
      const finalPrice = basePrice + addPrice;

      totalAcumulado += finalPrice * iten.quantity;

      const productOrder = await manager.save(ProductOrder, {
        orderId: order.id,
        productId: validated.product.id,
        observation: iten.observation || '',
        quantity: iten.quantity,
        price: finalPrice,
      });

      if (validated.productVariation && iten.productVariationId) {
        try {
          await manager.save(ProductVariationOrder, {
            productOrderId: productOrder.id,
            productVariationId: validated.productVariation.id,
            price: addPrice,
          });
        } catch (vError) {
          console.warn('⚠️ [ITEM] Erro ao salvar variação:', vError);
        }
      }
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
      lock: { mode: 'pessimistic_write' } 
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

  async updateOrderStatus(orderId: number, status: OrderStatus, userId?: number, reason?: string) {
    const updateData: any = { status };
    const currentStatus = String(status);

    if (currentStatus === 'Cancelado' || currentStatus === 'CANCELADO') {
      if (userId) updateData.user = { id: userId }; 
      if (reason) updateData.cancellationDescription = reason;
    }

    await this.orderRepository.update(orderId, updateData);

    const order = await this.dataSource.getRepository(Order).findOne({ 
      where: { id: orderId }, relations: ['comanda', 'user'] 
    });
    
    const orderUserId = order?.user?.id; 

    if (!order || !order.comanda) return { comandaCancelled: false, comandaId: null, orderUserId };
    const comandaId = order.comanda.id;

    if (currentStatus === 'Cancelado' || currentStatus === 'CANCELADO') {
        const allOrders = await this.dataSource.getRepository(Order).find({ where: { comanda: { id: comandaId } } });
        
        const allCancelled = allOrders.every(o => o.status === OrderStatus.CANCELADO);

        if (allCancelled && allOrders.length > 0) {
            await this.comandaService.updateComandaStatus(comandaId, ComandaStatus.CANCELADA);
            return { comandaCancelled: true, comandaId, orderUserId };
        }
    }

    return { comandaCancelled: false, comandaId, orderUserId };
  }

  async getOrderWithDetails(orderId: number) {
    return await this.dataSource.getRepository(Order)
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.productOrders', 'po')
      .leftJoinAndSelect('po.product', 'product')
      .leftJoinAndSelect('po.variations', 'variation')
      .leftJoinAndSelect('variation.productVariation', 'pv')
      .where('order.id = :id', { id: orderId })
      .getOne();
  }
}