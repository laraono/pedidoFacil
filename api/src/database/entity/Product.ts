import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, DeleteDateColumn, CreateDateColumn } from "typeorm"
import { ProductVariation } from "./ProductVariation"
import { Category } from "./Category"
import { ProductOrder } from "./ProductOrder"
import { ProductStatus } from "../../enum"

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
        default: true
    })
    description?: string

    @Column({
        type: 'boolean',
        name: 'is_available',
        nullable: false
    })
    isAvailable: boolean

    @Column({
        name: 'preco_base',
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: false
    })
    basePrice: number

    @Column({
        type: 'varchar',
        name: 'status',
        nullable: false,
        length: 30
    })
    status: ProductStatus

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

    @OneToMany(() => ProductOrder, (productOrders) => productOrders.product)
    productOrders: ProductOrder[]

    @OneToMany(() => ProductVariation, (productVariation) => productVariation.product)
    productVariations: ProductVariation[]

    @ManyToOne(() => Category, (category) => category.products)
    category: Category

}
