import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, DeleteDateColumn, CreateDateColumn, JoinColumn } from "typeorm"
import { ProductVariation } from "./ProductVariation"
import { Category } from "./Category"
import { ProductOrder } from "./ProductOrder"
import { ProductStatus } from "../../enum"
import { Establishment } from "./Establishment"

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
        name: 'Preco_Base',
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: false
    })
    basePrice!: number

    @Column({
        type: 'enum',
        enum: ['Ativo', 'Inativo'],
        name: 'Status',
        nullable: false,
        default: 'Ativo',
    })
    status!: ProductStatus

    @DeleteDateColumn({
        name: 'Data_Exclusao',
        type: 'datetime',
        nullable: true
    })
    deletedAt?: Date

    @OneToMany(() => ProductOrder, (productOrders) => productOrders.product)
    productOrders?: ProductOrder[]

    @OneToMany(() => ProductVariation, (productVariation) => productVariation.product)
    productVariations?: ProductVariation[]

    @ManyToOne(() => Category, (category) => category.products)
    @JoinColumn({
        name: 'ID_Categoria'
    })
    category?: Category

    @ManyToOne(() => Establishment, (establishment) => establishment.products)
    @JoinColumn({
        name: 'ID_Estabelecimento'
    })
    establishment?: Establishment

}
