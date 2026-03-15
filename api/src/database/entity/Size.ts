import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, ManyToOne } from "typeorm"
import { Comanda } from "./Comanda"
import { Order } from "./Order"
import { Product } from "./Product"
import { ProductOrder } from "./ProductOrder"

@Entity({name: 'Tamanho'})
export class Size {

    @PrimaryGeneratedColumn({
        name: 'id'
    })
    id: number

    @Column({
        type: 'varchar',
        name: 'name',
        nullable: false,
        length: 50
    })
    name: string

    @Column({
        type: 'varchar',
        name: 'description',
        nullable: false
    })
    price: string

    @Column({
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: false
    })
    createdAt: Date

    @Column({
        name: 'deleted_at',
        type: 'datetime',
        nullable: true
    })
    deletedAt?: Date

    @ManyToOne(() => Product, (product) => product.sizes)
    product: Product

    @OneToMany(() => ProductOrder, (productOrders) => productOrders.size)
    productOrders: ProductOrder[]

}
