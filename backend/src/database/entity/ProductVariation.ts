import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, DeleteDateColumn, JoinColumn } from "typeorm"
import { Product } from "./Product"
import { ProductOrder } from "./ProductOrder"

@Entity({name: 'PRODUTO_VARIACAO'})
export class ProductVariation {

    @PrimaryGeneratedColumn({
        name: 'ID_Variacao'
    })
    id!: number

    @Column({
        type: 'varchar',
        name: 'Nome',
        nullable: false,
        length: 50
    })
    name!: string

    @Column({
        name: 'Preco_Adicional',
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: false
    })
    addPrice!: number

    @Column({
        type: 'boolean',
        name: 'Ativo',
        nullable: false,
        default: true
    })
    ativo!: boolean

    @DeleteDateColumn({
        name: 'Data_Exclusao',
        type: 'timestamp',
        nullable: true
    })
    deletedAt?: Date

    @ManyToOne(() => Product, (product) => product.productVariations)
    @JoinColumn({
        name: 'ID_Produto'
    })
    product!: Product

    @OneToMany(() => ProductOrder, (productOrder) => productOrder.productVariation)
    productOrders!: ProductOrder[]

}
