import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, DeleteDateColumn, JoinColumn, Index } from "typeorm"
import { OrderStatus, ServiceType } from "../../enum"
import { Comanda } from "./Comanda"
import { ProductOrder } from "./ProductOrder"
import { User } from "./User"
import { PaymentOrder } from "./PaymentOrder"

@Entity({name: 'PEDIDO'})
@Index('idx_pedido_comanda_status_data', ['comanda', 'status', 'created_at'])
export class Order {

    @PrimaryGeneratedColumn({
        name: 'ID_Pedido'
    })
    id!: number

    @Column({
        type: 'varchar',
        name: 'Status',
        nullable: false,
        length: 30
    })
    status!: OrderStatus

    @Column({
        type: 'varchar',
        name: 'Observacao',
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
        nullable: false,
        length: 30
    })
    serviceType!: ServiceType

    @CreateDateColumn({ 
        name:  'Data_Hora_Chegada',
        type: "timestamp", 
        default: () => "CURRENT_TIMESTAMP(6)"
        })
    created_at!: Date;

    @ManyToOne(() => Comanda, (comanda) => comanda.pedidos)
    @JoinColumn({
        name: 'ID_Comanda'
    })
    comanda!: Comanda


    @OneToMany(() => ProductOrder, (productOrders) => productOrders.order)
    productOrders!: ProductOrder[]

    @ManyToOne(() => User)
    @JoinColumn({
        name: 'ID_Usuario_Cancelador'
    })
    user!: User

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({
        name: 'ID_Usuario_Criador'
    })
    createdBy?: User | null

    @OneToMany(() => PaymentOrder, (paymentOrder) => paymentOrder.order)
    paymentOrders!: PaymentOrder[]

}
