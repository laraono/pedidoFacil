import { Order } from "../database";
import { CreateOrder, ItensArray, ProductOrderParams } from "../dto";
import { OrderStatus } from "../enum";
import {  OrderRepository, ProductOrderRepository, ProductVariationRepository } from "../repository";
import { ComandaService } from "./ComandaService";
import { ProductService } from "./ProductService";

export class OrderService {

    private orderRepository: OrderRepository
    private productOrderRepository: ProductOrderRepository
    private productVariationRepository: ProductVariationRepository
    private comandaService: ComandaService
    private productService: ProductService

    constructor(
        orderRepository: OrderRepository,
        productOrderRepository: ProductOrderRepository,
        productVariationRepository: ProductVariationRepository,
        comandaService: ComandaService,
        productService: ProductService
    ) {
        this.orderRepository = orderRepository
        this.productOrderRepository = productOrderRepository
        this.productVariationRepository = productVariationRepository
        this.comandaService = comandaService
        this.productService = productService
    }

    async createOrder(createOrder: CreateOrder) {

        const comanda = await this.comandaService.getComanda(createOrder.comandaId)

        if(!comanda) {
            return
        }
        
        const order = await this.orderRepository.createOrder({status: createOrder.status, comanda}) 

        await this.saveItens(createOrder.itens, order)

        return order.id
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

    async saveItens(itens: ItensArray[], order: Order) {

        let total = 0

        itens.forEach(async (iten) => {
            const validatedProduct = await this.validateItens(iten)

            const value1 = Number(validatedProduct.product.basePrice)

            const value2 = validatedProduct.productVariation 
                ? Number(validatedProduct.productVariation.addPrice )
                : 0

            const price = value1 + value2

            const productOrder: ProductOrderParams = {
                ...validatedProduct,
                order,
                observation: iten.observation,
                quantity: iten.quantity,
                price
            }

            total += Number(productOrder.price)

            await this.productOrderRepository.createProductOrder(productOrder)
            await this.comandaService.updateComandaTotal(order.comanda, total)

        })

    }

    async validateItens(itens: ItensArray) {
        const product = await this.productService.getProduct(itens.productId)

        if(!product) {
            return
        }

        const productVariation =  await this.productVariationRepository.getProductVariation(itens.productVariationId)

        return {
            product, productVariation
        }


    }

    
} 