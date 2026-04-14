import { Entity, PrimaryGeneratedColumn, Column, OneToMany, PrimaryColumn, JoinColumn, CreateDateColumn, DeleteDateColumn, ManyToOne } from "typeorm"
import { ProductVariation } from "./ProductVariation"
import { Product } from "./Product"
import { Order } from "./Order"
import { Payment } from "./Payment"

@Entity({name: 'PAGAMENTO_PEDIDO'})
export class PaymentOrder {

    @PrimaryColumn({
        name: 'ID_Pedido',
        type: 'int'
    })
    orderId!: number

    @PrimaryColumn({
        name: 'ID_Pagamento',
        type: 'int'
    })
    paymentId!: number

    @Column({
        type: 'varchar',
        name: 'Observacoes_Cliente',
        nullable: true
    })
    observation?: string

    @Column({
        type: 'int',
        name: 'Quantidade',
        nullable: false
    })
    quantity?: number

    @Column({
        name: 'Valor_Pago_Deste_Pedido',
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: false
    })
    price!: number

    @ManyToOne(() => Payment, (payment) => payment.paymentOrders)
    @JoinColumn({name: 'ID_Pagamento'})
    payment?: Payment

    @ManyToOne(() => Order, (order) => order.paymentOrders)
    @JoinColumn({name: 'ID_Pedido'})
    order?: Order

}
