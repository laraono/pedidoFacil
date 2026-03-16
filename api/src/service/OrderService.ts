import { Comanda, Order } from "../database";
import { CreateOrder, ItensArray, ProductOrderParams } from "../dto";
import { OrderStatus } from "../enum";
import { AddonRepository, OrderRepository, ProductOrderRepository, SizeRepository } from "../repository";
import { ComandaService } from "./ComandaService";
import { ProductService } from "./ProductService";

export class OrderService {

    private addonRepository: AddonRepository
    private orderRepository: OrderRepository
    private productOrderRepository: ProductOrderRepository
    private sizeRepository: SizeRepository
    private comandaService: ComandaService
    private productService: ProductService

    constructor(
        addonRepository: AddonRepository,
        orderRepository: OrderRepository,
        productOrderRepository: ProductOrderRepository,
        sizeRepository: SizeRepository,
        comandaService: ComandaService,
        productService: ProductService
    ) {
        this.addonRepository = addonRepository
        this.orderRepository = orderRepository
        this.productOrderRepository = productOrderRepository
        this.sizeRepository = sizeRepository
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

            const productOrder: ProductOrderParams = {
                ...validatedProduct,
                order,
                observation: iten.observation,
                quantity: iten.quantity,
                price: validatedProduct.size.price
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

        const size =  await this.sizeRepository.getSize(itens.sizeId)

        if(!size) {
            return
        }

        const addon = itens.addOnId ? await this.addonRepository.getAddon(itens.addOnId) : undefined

        return  {
            product, size, addon
        }

    }

    
} 