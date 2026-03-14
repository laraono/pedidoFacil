import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from "typeorm"
import { Comanda } from "./Comanda"
import { Size } from "./Size"
import { Addon } from "./Addon"
import { Category } from "./Category"
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
