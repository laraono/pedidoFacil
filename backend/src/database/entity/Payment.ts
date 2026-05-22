import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    OneToMany, 
    ManyToOne, 
    DeleteDateColumn, 
    CreateDateColumn, 
    JoinColumn 
} from "typeorm"
import { Establishment } from "./Establishment"
import { User } from "./User"
import { PaymentOrder } from "./PaymentOrder"

export enum PaymentStatus {
    PENDING = 'Pendente',
    PAID = 'Aprovado',
    CANCELED = 'Cancelado',
    REFUNDED = 'Estornado'
}

@Entity({ name: 'PAGAMENTO' })
export class Payment {

    @PrimaryGeneratedColumn({ name: 'ID_Pagamento' })
    id!: number

    @Column({
        type: 'varchar',
        name: 'Forma_Pagamento',
        length: 50
    })
    paymentType!: string

    @Column({
        name: 'Valor_Total',
        type: "decimal",
        precision: 10,
        scale: 2,
        default: 0.00
    })
    totalValue!: number

    @Column({
        name: 'Valor_Taxa_Servico',
        type: "decimal",
        precision: 10,
        scale: 2,
        default: 0.00
    })
    serviceTax!: number 

    @Column({
        name: 'Troco',
        type: "decimal",
        precision: 10,
        scale: 2,
        default: 0.00
    })
    change!: number

    @Column({
        type: 'enum',
        enum: PaymentStatus,
        name: 'Status',
        default: PaymentStatus.PAID
    })
    status!: PaymentStatus

    @CreateDateColumn({ 
        type: "datetime", 
        name: 'Data_Hora_Pagamento'
    })
    createdAt!: Date

    @Column({
        name: 'ID_Pedido_MercadoPago',
        type: 'varchar',
        nullable: true
    })
    mercadoPagoOrderId?: string

    @Column({
        name: 'ID_Pagamento_MercadoPago',
        type: 'varchar',
        nullable: true
    })
    mercadoPagoPaymentId?: string

    @DeleteDateColumn({
        name: 'Data_Exclusao',
        type: 'datetime',
        nullable: true
    })
    deletedAt?: Date

    @ManyToOne(() => Establishment)
    @JoinColumn({ name: 'ID_Estabelecimento' })
    establishment!: Establishment

    @ManyToOne(() => User)
    @JoinColumn({ name: 'ID_Usuario_Caixa' }) 
    user!: User

    @OneToMany(() => PaymentOrder, (paymentOrder) => paymentOrder.payment)
    paymentOrders!: PaymentOrder[]
}