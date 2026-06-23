import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, ManyToOne, DeleteDateColumn, JoinColumn } from "typeorm"
import { ProductVariation } from "./ProductVariation"
import { Category } from "./Category"
import { ProductOrder } from "./ProductOrder"
import { StorageIten } from "./StorageIten"

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
        default: null
    })
    description?: string

    @Column({
        type: 'varchar',
        name: 'Imagem',
        nullable: true,
        length: 500
    })
    image?: string

    @Column({
        type: 'boolean',
        name: 'Estocavel',
        nullable: false
    })
    estocavel!: boolean

    @Column({
        type: 'boolean',
        name: 'Ativo',
        nullable: false,
        default: true
    })
    ativo!: boolean

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

    @OneToOne(() => StorageIten, (storage) => storage.product, { nullable: true })
    storageIten?: StorageIten

}
