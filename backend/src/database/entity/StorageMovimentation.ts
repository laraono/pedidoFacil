import { Entity, PrimaryGeneratedColumn, Column, OneToMany, PrimaryColumn, JoinColumn, CreateDateColumn, DeleteDateColumn, ManyToOne } from "typeorm"
import { ProductVariation } from "./ProductVariation"
import { Product } from "./Product"
import { Order } from "./Order"
import { MovimentationType } from "../../enum"
import { StorageIten } from "./StorageIten"
import { User } from "./User"

@Entity({name: 'MOVIMENTACAO_ESTOQUE'})
export class StorageMovimentation {

    @PrimaryGeneratedColumn({
        name: 'ID_Movimentacao'
    })
    id!: number

    @Column({
        type: 'varchar',
        name: 'Justificativa',
        nullable: true
    })
    reason?: string

    @Column({
        type: 'int',
        name: 'Quantidade',
        nullable: false
    })
    quantity!: number

    @Column({
        type: 'varchar',
        name: 'Tipo_Movimentacao',
        nullable: false,
    })
    type!: MovimentationType

    @ManyToOne(() => StorageIten, (iten) => iten.movimentations)
    @JoinColumn({
        name: 'ID_Estoque_Item'
    })
    storageIten!: StorageIten

    @ManyToOne(() => User, (user) => user.movimentations)
    @JoinColumn({
        name: 'ID_Usuario_Responsavel'
    })
    user!: User

}
