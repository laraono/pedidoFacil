import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm"
import { Product } from "./Product"
import { ProductOrder } from "./ProductOrder"

@Entity({name: 'Addon'})
export class Addon {

    @PrimaryGeneratedColumn({
        name: 'id'
    })
    id: number

    @Column({
        type: 'varchar',
        name: 'name',
        nullable: false,
        length: 100
    })
    name: string

    @Column({
        name: 'price',
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: false
    })
    price: number

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

    @OneToMany(() => ProductOrder, (productOrders) => productOrders.addon)
    productOrders: ProductOrder[]

}
