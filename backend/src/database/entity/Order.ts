import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, DeleteDateColumn, JoinColumn, OneToOne } from "typeorm"
import { OrderStatus, ServiceType } from "../../enum"
import { Comanda } from "./Comanda"
import { ProductOrder } from "./ProductOrder"
import { Establishment } from "./Establishment"
import { User } from "./User"
import { PaymentOrder } from "./PaymentOrder"

@Entity({name: 'PEDIDO'})
export class Order {

    @PrimaryGeneratedColumn({
        name: 'ID_Pedido'
    })
    id: number

    @Column({
        type: 'varchar',
        name: 'Status',
        nullable: false,
        length: 30,
        default: OrderStatus.AGUARDANDO_PREPARO
    })
    status: OrderStatus

    @Column({
        type: 'varchar',
        name: 'Observacoes_Geral',
        nullable: true,
    })
    observation?: string

    @Column({
        type: 'varchar',
        name: 'Cancelamento_Descricao',
        nullable: true,
    })
    cancellationDescription?: string

    @Column({
        type: 'varchar',
        name: 'Tipo_Atendimento',
        nullable: true,
        length: 30
    })
    serviceType?: ServiceType

    @Column({
        name: 'Custo_Adicional_Viagem',
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: true
    })
    tripPrice?: number

    @Column({
        type: 'boolean',
        name: 'seEntregue',
        nullable: false,
        default: false
    })
    isDelivered: boolean

    @CreateDateColumn({ 
        name:  'Data_Hora_Chegada',
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

    @Column({
        name: 'Valor_Total',
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: false,
        default: 0
    })
    total: number

    @ManyToOne(() => Comanda, (comanda) => comanda.orders)
    @JoinColumn({
        name: 'ID_Comanda'
    })
    comanda: Comanda

    @ManyToOne(() => Establishment, (establishment) => establishment.orders)
    @JoinColumn({
        name: 'ID_Estabelecimento'
    })
    establishment: Establishment

    @OneToMany(() => ProductOrder, (productOrders) => productOrders.order)
    productOrders: ProductOrder[]

    @OneToOne(() => User)
    @JoinColumn({
        name: 'ID_Usuario_Cancelador'
    })
    user: User

    @OneToMany(() => PaymentOrder, (paymentOrder) => paymentOrder.order)
    paymentOrders: PaymentOrder[]

}
