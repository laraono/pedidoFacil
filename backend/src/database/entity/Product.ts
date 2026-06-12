import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, DeleteDateColumn, JoinColumn } from "typeorm"
import { ProductVariation } from "./ProductVariation"
import { Category } from "./Category"
import { ProductOrder } from "./ProductOrder"

@Entity({name: 'PRODUTO'})
export class Product {

    @PrimaryGeneratedColumn({
        name: 'ID_Produto'
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
        type: 'varchar',
        name: 'Descricao',
        nullable: true,
        default: true
    })
    description?: string

    @Column({
        type: 'longtext',
        name: 'Imagem',
        nullable: true,
    })
    image?: string

    @Column({
        type: 'boolean',
        name: 'Estocavel',
        nullable: false
    })
    estocavel!: boolean

    @Column({
        type: 'varchar',
        name: 'Status',
        nullable: false,
        default: 'Ativo'
    })
    status!: string

    @Column({
        name: 'Preco_Base',
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: false
    })
    basePrice!: number

    @DeleteDateColumn({
        name: 'Data_Exclusao',
        type: 'timestamp',
        nullable: true
    })
    deletedAt?: Date

    @OneToMany(() => ProductOrder, (productOrders) => productOrders.product)
    productOrders!: ProductOrder[]

    @OneToMany(() => ProductVariation, (productVariation) => productVariation.product)
    productVariations!: ProductVariation[]

    @ManyToOne(() => Category, (category) => category.products)
    @JoinColumn({
        name: 'ID_Categoria'
    })
    category!: Category

}
