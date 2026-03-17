import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, DeleteDateColumn } from "typeorm"
import { OrderStatus } from "../../enum"
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
    status: OrderStatus

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

    @ManyToOne(() => Comanda, (comanda) => comanda.pedidos)
    comanda: Comanda

    @OneToMany(() => ProductOrder, (productOrders) => productOrders.order)
    productOrders: ProductOrder[]

}
