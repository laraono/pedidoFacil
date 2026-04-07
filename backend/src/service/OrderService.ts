import { DataSource, EntityManager } from 'typeorm';
import {
  AppDataSource,
  Order,
  Product,
  ProductOrder,
  ProductVariation,
  ProductVariationOrder,
} from '../database';
import { CreateOrder, ItensArray, ProductOrderParams } from '../dto';
import { OrderStatus } from '../enum';
import { AppError } from '../middleware';
import {
  OrderRepository,
  ProductOrderRepository,
  ProductVariationOrderRepository,
  ProductVariationRepository,
} from '../repository';
import { ComandaService } from './ComandaService';
import { ProductService } from './ProductService';

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
        isDelivered: false
      });

      await this.saveItens(createOrder.itens, order, manager);

      return order;
    });
  }

  async saveItens(itens: any[], order: Order, manager: EntityManager) {
    let totalAcumulado = 0;

    for (const iten of itens) {
      const validated = await this.validateItens(iten, manager);

      const basePrice = Number(validated.product.basePrice);
      const addPrice = validated.productVariation ? Number(validated.productVariation.addPrice) : 0;
      const finalPrice = basePrice + addPrice;

      totalAcumulado += (finalPrice * iten.quantity);

      const productOrder = await manager.save(ProductOrder, {
        orderId: order.id, 
        productId: validated.product.id,
        observation: iten.observation || '',
        quantity: iten.quantity,
        price: finalPrice
      });

      if (validated.productVariation && iten.productVariationId) {
        try {
          await manager.save(ProductVariationOrder, {
            productId: productOrder.productId,
            orderId: productOrder.orderId,
            productVariationid: validated.productVariation.id,
            price: addPrice
          });
        } catch (vError) {
          console.warn("⚠️ [ITEM] Erro ao salvar variação, mas seguindo adiante:", vError);
        }
      }
    }

    await this.comandaService.updateComandaTotalTransaction(order.comanda, totalAcumulado, manager);
  }

  async validateItens(iten: any, manager: EntityManager) {
    const product = await manager.findOne(Product, { where: { id: iten.productId } });
    if (!product) throw new AppError(`Produto ${iten.productId} não existe`, 400);

    let productVariation = null;
    if (iten.productVariationId) {
      productVariation = await manager.findOne(ProductVariation, { 
        where: { id: iten.productVariationId } 
      });
    }

    return { product, productVariation };
  }

  async listOrders() {
    return await this.orderRepository.listOrders();
  }

  async listOrdersByComanda(comandaId: number) {
    return await this.orderRepository.listOrdersByComanda(comandaId);
  }

  async updateOrderStatus(orderId: number, status: OrderStatus) {
    await this.orderRepository.updateOrderStatus(orderId, status);
  }
}