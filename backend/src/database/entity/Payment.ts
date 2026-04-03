import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, DeleteDateColumn, CreateDateColumn, JoinColumn } from "typeorm"
import { ProductVariation } from "./ProductVariation"
import { Category } from "./Category"
import { ProductOrder } from "./ProductOrder"
import { ProductStatus } from "../../enum"
import { Establishment } from "./Establishment"
import { User } from "./User"
import { PaymentOrder } from "./PaymentOrder"

@Entity({name: 'PAGAMENTO'})
export class Payment {

    @PrimaryGeneratedColumn({
        name: 'ID_Pagamento'
    })
    id: number

    @Column({
        type: 'varchar',
        name: 'Forma_Pagamento',
        nullable: false,
        length: 50
    })
    paymentType: string

    @Column({
        name: 'Valor_Total',
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: false
    })
    total: number

    @Column({
        name: 'Valor_Taxa_Servico',
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: true
    })
    serviceTAx: number

    @Column({
        name: 'Troco',
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: true
    })
    change: number

    @CreateDateColumn({ 
        type: "datetime", 
        default: () => "CURRENT_TIMESTAMP(6)",
        name: 'Data_Hora_Pagamento'
     })
    created_at: Date;

    @DeleteDateColumn({
        name: 'deleted_at',
        type: 'datetime',
        nullable: true
    })
    deletedAt?: Date

    @ManyToOne(() => Establishment, (establishment) => establishment.payments)
    @JoinColumn({
        name: 'ID_Estabelecimento'
    })
    establishment: Establishment

    @ManyToOne(() => User, (user) => user.payments)
    @JoinColumn({
        name: 'ID_Caixa'
    })
    user: User

    @OneToMany(() => PaymentOrder, (paymentOrder) => paymentOrder.payment)
    paymentOrders: PaymentOrder[]
}
