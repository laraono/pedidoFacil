import { Entity, PrimaryGeneratedColumn, Column, OneToMany, PrimaryColumn, JoinColumn, CreateDateColumn, DeleteDateColumn, ManyToOne, OneToOne } from "typeorm"
import { ProductVariation } from "./ProductVariation"
import { Product } from "./Product"
import { Order } from "./Order"
import { ProductVariationOrder } from "./ProductVariationOrder"

@Entity({name: 'ITEM_PEDIDO'})
export class ProductOrder {

    @PrimaryGeneratedColumn({
        name: "ID_Item_Pedido"
    })
    id: number

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
    quantity: number

    @Column({
        name: 'Preco_Unitario_Momento',
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

    @ManyToOne(() => Product, (product) => product.productOrders)
    @JoinColumn({name: 'ID_Produto'})
    product: Product

    @ManyToOne(() => Order, (category) => category.productOrders)
    @JoinColumn({name: 'ID_Pedido'})
    order: Order

    @OneToOne(() => ProductVariationOrder)
    productVariantionOrder: ProductVariationOrder

}
