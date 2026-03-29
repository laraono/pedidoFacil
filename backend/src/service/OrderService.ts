import { DataSource, EntityManager } from "typeorm";
import { AppDataSource, Order, Product, ProductOrder, ProductVariation, ProductVariationOrder } from "../database";
import { CreateOrder, ItensArray, ProductOrderParams } from "../dto";
import { OrderStatus } from "../enum";
import { AppError } from "../middleware";
import {  OrderRepository, ProductOrderRepository, ProductVariationOrderRepository, ProductVariationRepository } from "../repository";
import { ComandaService } from "./ComandaService";
import { ProductService } from "./ProductService";

export class OrderService {

    private dataSource: DataSource
    private orderRepository: OrderRepository
    private comandaService: ComandaService

    constructor(
        dataSource: DataSource,
        orderRepository: OrderRepository,
        comandaService: ComandaService,
    ) {
        this.dataSource = dataSource
        this.orderRepository = orderRepository
        this.comandaService = comandaService
    }

    async createOrder(data: CreateOrder & { comandaId: number }) {
        const comanda = await this.comandaService.getComanda(data.comandaId)
        if (!comanda) throw new AppError('Comanda não encontrada', 404)
        return await this.createOrderWithTransaction(data, comanda)
    }

    async createOrderWithTransaction(createOrder: CreateOrder, comanda: any) {
        return await this.dataSource.transaction(async (transactionalEntityManager) => {
            
            const comanda = await this.comandaService.getComanda(createOrder.comandaId)

            if(!comanda) {
                throw new AppError('Comanda não existe', 400)
            }

            const order = await transactionalEntityManager.save(Order, {
                status: createOrder.status,
                comanda
            });

            await this.saveItens(createOrder.itens, order, transactionalEntityManager);

            return order;
        });
    }

    async listOrders() {
        return await this.orderRepository.listOrders()
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

            await manager.save(ProductVariationOrder, {
                productId: newProductOrder.product.id,
                orderId: newProductOrder.order.id,
                productVariationid: validatedProduct.productVariation.id,
                price: value2
            });
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

    
} 