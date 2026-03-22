import { Entity, PrimaryGeneratedColumn, Column, OneToMany, PrimaryColumn, JoinColumn, CreateDateColumn, DeleteDateColumn, ManyToOne } from "typeorm"
import { ProductVariation } from "./ProductVariation"
import { Product } from "./Product"
import { Order } from "./Order"

@Entity({name: 'ItemPedidoVariacao'})
export class ProductVariationOrder {

    @PrimaryColumn({
        name: 'id-pedido',
        type: 'int'
    })
    orderId: number

    @PrimaryColumn({
        name: 'id-produto-variacao',
        type: 'int'
    })
    productVariationId: number

    @Column({
        type: 'varchar',
        name: 'observation',
        nullable: true
    })
    observation?: string

    @Column({
        type: 'int',
        name: 'quantity',
        nullable: false
    })
    quantity: number

    @Column({
        name: 'preco',
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: false
    })
    price: number

    @CreateDateColumn({ 
        type: "timestamp", 
        default: () => "CURRENT_TIMESTAMP(6)"
        })
    created_at: Date;

    @DeleteDateColumn({
        name: 'deleted_at',
        type: 'datetime',
        nullable: true
    })
    deletedAt?: Date

    @ManyToOne(() => ProductVariation, (productVariation) => productVariation.productVariationOrders)
    @JoinColumn({name: 'id-produto-variacao'})
    productVariation: ProductVariation

    @ManyToOne(() => Order, (category) => category.productOrders)
    @JoinColumn({name: 'id-pedido'})
    order: Order

}
