import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { Size } from "./Size"
import { Addon } from "./Addon"
import { Product } from "./Product"
import { Order } from "./Order"

@Entity({name: 'ProdutoPedido'})
export class ProductOrder {

    @PrimaryGeneratedColumn({
        name: 'id'
    })
    id: number

    @Column({
        type: 'varchar',
        name: 'observation',
        nullable: false
    })
    observation: string

    @Column({
        type: 'int',
        name: 'quantity',
        nullable: false
    })
    quantity: string

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
    size: Size

    @OneToMany(() => Addon, (addons) => addons.productOrders)
    addon: Addon

    @OneToMany(() => Product, (category) => category.productOrders)
    product: Product

    @OneToMany(() => Order, (category) => category.productOrders)
    order: Order

}
