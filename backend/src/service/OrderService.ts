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

    private dataSource: DataSource
    private establishmentRepository: EstablishmentRepository
    private orderRepository: OrderRepository
    private userRepository: UserRepository
    private comandaService: ComandaService

    constructor(
        dataSource: DataSource,
        establishmentRepository: EstablishmentRepository,
        orderRepository: OrderRepository,
        userRepository: UserRepository,
        comandaService: ComandaService,
    ) {
        this.dataSource = dataSource
        this.establishmentRepository = establishmentRepository
        this.orderRepository = orderRepository
        this.userRepository = userRepository
        this.comandaService = comandaService
    }

    async createOrder(createOrder: CreateOrder) {
        return await this.dataSource.transaction(async (transactionalEntityManager) => {
            
            const comanda = await this.comandaService.getComanda(createOrder.comandaId)

            if(!comanda) {
                throw new AppError('Comanda não existe', 400)
            }

            const establishment = await this.establishmentRepository.getEstablishment(createOrder.establishmentId)

            if(!establishment) {
                throw new AppError('Estabelecimento não encontrado', 400)
            }

            const order = await transactionalEntityManager.save(Order, {
                status: createOrder.status,
                comanda,
                establishment,
                serviceType: ServiceType.AUTOATENDIMENTO
            });

      await this.saveItens(createOrder.itens, order, manager);

      return order;
    });
  }

    async listOrders({establishmentId}: {establishmentId: number}) {
        const orders = await this.orderRepository.listOrders(establishmentId)
        return orders
    }

    async listOrdersByComanda(comandaId: number) {
        return await this.orderRepository.listOrdersByComanda(comandaId)
    }

    async updateOrderStatus(orderId: number, status: OrderStatus) {
        await this.orderRepository.updateOrderStatus(orderId, status)
    }

    async cancelOrder(orderId: number, params: CancelOrder) {
        const comanda = await this.comandaService.getComanda(params.comandaId)

        if(!comanda) {
            throw new AppError('Comanda não existe', 400)
        }

        const establishment = await this.establishmentRepository.getEstablishment(params.establishmentId)

        if(!establishment) {
            throw new AppError('Estabelecimento não encontrado', 400)
        }

        const user = await this.userRepository.getUser(params.userId)

        if(!user) {
            throw new AppError('Usuário não existe', 400)
        }

        await this.orderRepository.cancelOrder(orderId, {
            user, 
            cancellationDescription: params.cancellationDescription,
            status: OrderStatus.CANCELADO
        })
    }

    async saveItens(
        itens: ItensArray[], 
        order: Order, 
        manager: EntityManager 
    ) {
        let total = 0;

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

            const newProductOrder = await manager.save(ProductOrder, productOrder);

            if(validatedProduct.productVariation) {
                await manager.save(ProductVariationOrder, {
                    productId: newProductOrder.product.id,
                    orderId: newProductOrder.order.id,
                    productVariationId: validatedProduct.productVariation.id,
                    price: value2
                });
            }
        }
      }
    }

    await this.comandaService.updateComandaTotalTransaction(order.comanda, totalAcumulado, manager);
  }

    async validateItens(itens: ItensArray, manager: EntityManager) {

        const product = await manager.findOne(Product, { 
            where: { id: itens.productId } 
        });

        if (!product) {
            throw new AppError('Produto não existe', 400);
        }

        const productVariation = await manager.findOne(ProductVariation, { 
            where: { id: itens.productVariationId } 
        });

        return {
            product, 
            productVariation
        };
    }
    
} 