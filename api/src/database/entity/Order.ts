import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm"
import { PedidoStatus } from "../../enum"
import { Comanda } from "./Comanda"
import { ProductOrder } from "./ProductOrder"

@Entity({name: 'Pedido'})
export class Order {

    @PrimaryGeneratedColumn({
        name: 'id'
    })
    id: number

    @Column({
        type: 'varchar',
        name: 'status',
        nullable: false,
        length: 30
    })
    status: PedidoStatus

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
    deletedAt: Date

    @ManyToOne(() => Comanda, (comanda) => comanda.pedidos)
    comanda: Comanda

    @OneToMany(() => ProductOrder, (productOrders) => productOrders.order)
    productOrders: ProductOrder[]

}
