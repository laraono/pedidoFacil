import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, DeleteDateColumn, CreateDateColumn, JoinColumn, OneToOne } from "typeorm"
import { ProductOrder } from "./ProductOrder"
import { MovimentationType, ProductStatus } from "../../enum"
import { Product } from "./Product"
import { StorageMovimentation } from "./StorageMovimentation"

@Entity({name: 'ESTOQUE_ITEM'})
export class StorageIten {

    @PrimaryGeneratedColumn({
        name: 'ID_Estoque_Item'
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
        name: 'Unidade_Medida',
        nullable: false,
    })
    unit!: string

    @Column({
        type: 'int',
        name: 'Quantidade_Atual',
        nullable: false,
    })
    quantity!: number

    @DeleteDateColumn({
        name: 'Data_Exclusao',
        type: 'datetime',
        nullable: false
    })
    deletedAt?: Date

    @OneToMany(() => StorageMovimentation, (movimentation) => movimentation.storageIten)
    movimentations!: StorageMovimentation[]

    @OneToOne(() => Product)
    @JoinColumn({
        name: 'ID_Produto'
    })
    product!: Product

}
