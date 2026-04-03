import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn, DeleteDateColumn, JoinColumn } from "typeorm"
import { Product } from "./Product"
import { ProductOrder } from "./ProductOrder"
import { ProductStatus, ProductVariationType } from "../../enum"
import { ProductVariationOrder } from "./ProductVariationOrder"

@Entity({name: 'PRODUTO_VARIACAO'})
export class ProductVariation {

    @PrimaryGeneratedColumn({
        name: 'ID_Variacao'
    })
    id: number

    @Column({
        type: 'varchar',
        name: 'Nome',
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
        length: 30,
        default: ProductStatus.ATIVO
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
    @JoinColumn({
        name: 'ID_Produto'
    })
    product: Product

    @OneToMany(() => ProductVariationOrder, (productVariationOrder) => productVariationOrder.productVariation)
    productVariationOrders: ProductVariationOrder[]

}
