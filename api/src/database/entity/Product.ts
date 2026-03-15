import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm"
import { Size } from "./Size"
import { Addon } from "./Addon"
import { Category } from "./Category"
import { ProductOrder } from "./ProductOrder"

@Entity({name: 'Produto'})
export class Product {

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
        nullable: false,
        default: false
    })
    description: string

    @Column({
        type: 'boolean',
        name: 'is_available',
        nullable: false
    })
    isAvailable: boolean

    @Column({
        name: 'created_at',
        type: 'datetime',
        nullable: false
    })
    createdAt: Date

    @Column({
        name: 'deleted_at',
        type: 'datetime',
        nullable: true
    })
    deletedAt?: Date

    @OneToMany(() => Size, (sizes) => sizes.product)
    sizes: Size[]

    @OneToMany(() => Addon, (addons) => addons.product)
    addons: Addon[]

    @ManyToOne(() => Category, (category) => category.products)
    category: Category

    @OneToMany(() => ProductOrder, (productOrders) => productOrders.product)
    productOrders: ProductOrder[]

}
