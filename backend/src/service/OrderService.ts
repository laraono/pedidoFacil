import { DataSource, EntityManager } from "typeorm";
import { Order, Product, ProductOrder, ProductVariation, ProductVariationOrder } from "../database";
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

            await this.saveItens(createOrder.itens, order, transactionalEntityManager);

            return order;
        });
    }

    async listOrders(establishmentId: number) {
        return await this.orderRepository.listOrders(establishmentId)
    }

    async listOrdersByComanda(comandaId: number) {
        return await this.orderRepository.listOrdersByComanda(comandaId)
    }

    async updateOrderStatus(orderId: number, status: OrderStatus) {
        await this.orderRepository.updateOrderStatus(orderId, status)
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

    async cancelComanda(params: CancelOrder) {
    
        const user = await this.userRepository.getUser(params.userId)

        if(!user) {
            throw new AppError('Usuário não existe', 409)
        }

        const establishment = await this.establishmentRepository.getEstablishment(params.establishmentId)

        if(!establishment) {
            throw new AppError("Estabelecimento não encontrado", 400)
        }

        await this.orderRepository.cancelOrder(
            params.comandaId, 
            {
                user, 
                establishment,
                cancellationDescription: params.cancellationDescription, 
                status: OrderStatus.CANCELADO
            }
        )
    }


    
} 