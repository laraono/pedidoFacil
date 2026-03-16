import { Entity, PrimaryGeneratedColumn, Column, OneToMany, PrimaryColumn, JoinColumn, CreateDateColumn, DeleteDateColumn, ManyToOne } from "typeorm"
import { Size } from "./Size"
import { Addon } from "./Addon"
import { Product } from "./Product"
import { Order } from "./Order"

@Entity({name: 'ProdutoPedido'})
export class ProductOrder {

    @PrimaryColumn({
        name: 'id-produto',
        type: 'int'
    })
    productId: number

    @PrimaryColumn({
        name: 'id-pedido',
        type: 'int'
    })
    orderId: number

    @PrimaryColumn({
        name: 'id-tamanho',
        type: 'int'
    })
    sizeId: number

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
        name: 'price',
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

    @ManyToOne(() => Size, (sizes) => sizes.productOrders)
    @JoinColumn({name: 'id-tamanho'})
    size?: Size

    @ManyToOne(() => Addon, (addons) => addons.productOrders)
    addon?: Addon

    @ManyToOne(() => Product, (category) => category.productOrders)
    @JoinColumn({name: 'id-produto'})
    product: Product

    @ManyToOne(() => Order, (category) => category.productOrders)
    @JoinColumn({name: 'id-pedido'})
    order: Order

}
