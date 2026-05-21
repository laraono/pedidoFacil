import { Entity, Column, OneToMany, PrimaryGeneratedColumn, JoinColumn, CreateDateColumn, DeleteDateColumn, ManyToOne } from "typeorm"
import { Product } from "./Product"
import { Order } from "./Order"
import { ProductVariationOrder } from "./ProductVariationOrder"

@Entity({name: 'ItemPedido'})
export class ProductOrder {

    @PrimaryGeneratedColumn({
        name: 'ID_Item',
        type: 'int'
    })
    id!: number

    @Column({
        name: 'ID_Pedido',
        type: 'int'
    })
    orderId!: number

    @Column({
        name: 'ID_Produto',
        type: 'int'
    })
    productId!: number

    @Column({
        type: 'varchar',
        name: 'Observacoes_Cliente',
        nullable: true
    })
    observation?: string

    @Column({
        type: 'int',
        name: 'Quantidade',
        nullable: false
    })
    quantity!: number

    @Column({
        name: 'Preco_Unitario_Momento',
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: false
    })
    price!: number

    @CreateDateColumn({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP(6)"
    })
    created_at!: Date;

    @DeleteDateColumn({
        name: 'deleted_at',
        type: 'datetime',
        nullable: true
    })
    deletedAt?: Date

    @ManyToOne(() => Product, (product) => product.productOrders)
    @JoinColumn({name: 'ID_Produto'})
    product!: Product

    @ManyToOne(() => Order, (order) => order.productOrders)
    @JoinColumn({name: 'ID_Pedido'})
    order!: Order

    @OneToMany(() => ProductVariationOrder, (variation) => variation.productOrder)
    variations!: ProductVariationOrder[]

}
