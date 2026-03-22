import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn, DeleteDateColumn } from "typeorm"
import { Product } from "./Product"
import { ProductOrder } from "./ProductOrder"
import { ProductStatus } from "../../enum"
import { ProductVariationOrder } from "./ProductVariationOrder"

@Entity({name: 'Produto_Variacao'})
export class ProductVariation {

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
        name: 'preco_adicional',
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: false
    })
    addPrice: number

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

    @ManyToOne(() => Product, (product) => product.productVariations)
    product: Product

    @OneToMany(() => ProductVariationOrder, (productVariationOrder) => productVariationOrder.productVariation)
    productVariationOrders: ProductVariationOrder[]

}
