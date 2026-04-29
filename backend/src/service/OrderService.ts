import { DataSource, EntityManager } from "typeorm";
import { Comanda, Establishment, Order, Product, ProductOrder, ProductVariation, ProductVariationOrder } from "../database";
import { CancelOrder, CreateOrder, ItensArray, ProductOrderParams } from "../dto";
import { OrderStatus, ServiceType } from "../enum";
import { AppError } from "../middleware";
import {  EstablishmentRepository, OrderRepository, UserRepository} from "../repository";
import { ComandaService } from "./ComandaService";

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

    async getOrder(comandaId: number, orderId: number) {
        const comanda = await this.comandaService.getComanda(comandaId)

        if(!comanda) {
            throw new AppError('Comanda não existe', 400)
        }

        return await this.orderRepository.getOrder(orderId)
    }

    async createOrder(createOrder: CreateOrder) {
        return await this.dataSource.transaction(async (transactionalEntityManager) => {
            
            const comanda = await transactionalEntityManager.findOne(Comanda, {
                where: {  id: createOrder.comandaId}
            })

            if(!comanda) {
                throw new AppError('Comanda não existe', 400)
            }

            const establishment = await transactionalEntityManager.findOne(Establishment, {
                where: {  id: createOrder.establishmentId}
            })

            if(!establishment) {
                throw new AppError('Estabelecimento não encontrado', 400)
            }

            const order = await transactionalEntityManager.save(Order, {
                status: createOrder.status,
                comanda,
                establishment,
                serviceType: ServiceType.AUTOATENDIMENTO
            });

            const total = await this.saveItens(createOrder.itens, order, transactionalEntityManager);

            await transactionalEntityManager.update(Order, order.id, {total})

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
            const validatedProduct = await this.validateItens(iten, manager);

            const value1 = Number(validatedProduct.product.basePrice);
            const value2 = validatedProduct.productVariation 
                ? Number(validatedProduct.productVariation.addPrice) 
                : 0;

            const price = value1 + value2;
            total += price;

            const productOrder: ProductOrderParams = {
                ...validatedProduct,
                order,
                observation: iten.observation,
                quantity: iten.quantity,
                price
            };

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

        await this.comandaService.updateComandaTotalTransaction(order.comanda, total, manager);

        return total
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

        if(productVariation) {

            return {
                product, 
                productVariation
            };
        } else {
            return {product}
        }

    }
    
} 