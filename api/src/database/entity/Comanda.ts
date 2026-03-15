import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { ComandaStatus } from "../../enum"
import { Order } from "./Order"

@Entity({name: 'Comanda'})
export class Comanda {

    @PrimaryGeneratedColumn({
        name: 'id'
    })
    id: number

    @Column({
        type: 'varchar',
        name: 'label',
        nullable: false,
        length: 30
    })
    label: string

    @Column({
        type: 'varchar',
        name: 'status',
        nullable: false,
        length: 30
    })
    status: ComandaStatus

    @Column({
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: false

    })
    total: number

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

    @OneToMany(() => Order, (pedido) => pedido.comanda)
    pedidos: Order[]

}
