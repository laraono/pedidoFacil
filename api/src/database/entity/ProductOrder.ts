import { Entity, PrimaryGeneratedColumn, Column, OneToMany, PrimaryColumn, JoinColumn } from "typeorm"
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

    @Column({
        name: 'created_at',
        type: 'datetime',
        nullable: false
    })
    createdAt: Date

    @OneToMany(() => Size, (sizes) => sizes.productOrders)
    size?: Size

    @OneToMany(() => Addon, (addons) => addons.productOrders)
    addon?: Addon

    @OneToMany(() => Product, (category) => category.productOrders)
    @JoinColumn({name: 'id-produto'})
    product: Product

    @OneToMany(() => Order, (category) => category.productOrders)
    @JoinColumn({name: 'id-pedido'})
    order: Order

}
