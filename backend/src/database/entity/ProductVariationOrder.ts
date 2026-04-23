import { Entity, PrimaryGeneratedColumn, Column, OneToMany, PrimaryColumn, JoinColumn, CreateDateColumn, DeleteDateColumn, ManyToOne, OneToOne } from "typeorm"
import { ProductVariation } from "./ProductVariation"
import { Product } from "./Product"
import { Order } from "./Order"
import { ProductOrder } from "./ProductOrder"

@Entity({name: 'ItemPedidoVariacao'})
export class ProductVariationOrder {

    @PrimaryColumn({
        name: 'ID_Item_Pedido',
        type: 'int'
    })
    orderId: number

    @PrimaryColumn({
        name: 'ID_Variacao',
        type: 'int'
    })
    productVariationId: number

    @Column({
        name: 'Preco_Adicional_Momento',
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
    @JoinColumn({name: 'ID_Variacao'})
    productVariation: ProductVariation

    @OneToOne(() => ProductOrder)
    @JoinColumn({name: 'ID_Item_Pedido'})
    order: ProductOrder

}
