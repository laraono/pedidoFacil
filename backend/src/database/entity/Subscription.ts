import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, DeleteDateColumn } from "typeorm"
import { SubscriptionStatus, UserStatus } from "../../enum"
import { Plan } from "./Plan"
import { Establishment } from "./Establishment"

@Entity({name: 'ASSINATURA'})
export class Subscription {

    @PrimaryGeneratedColumn({
        name: 'ID_Assinatura'
    })
    id!: number

    @Column({
        type: 'date',
        name: 'Data_Inicio',
        nullable: false,
    })
    initialDate!: Date

    @Column({
        type: 'date',
        name: 'Data_Vencimento_Prox',
        nullable: false,
    })
    expirationDate!: Date

    @Column({
        type: 'varchar',
        name: 'Status',
        nullable: false,
        default: SubscriptionStatus.PENDENTE
    })
    status!: SubscriptionStatus

    @Column({
        type: 'date',
        name: 'Ultima_Data_Pagamento',
        nullable: true,
    })
    lastPayment?: Date

    @Column({
        name: 'Recibo_URL',
        type: 'varchar',
        nullable: true
    })
    receipt?: string

    @Column({
        type: 'varchar',
        name: 'Mercado_Pago_Id',
        nullable: false,
    })
    mercadoPagoId!: string

    @Column({
        name: 'Valor_Assinatura',
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: false
    })
    price!: number

    @CreateDateColumn({ 
        name:  'Data_Hora_Criacao',
        type: "timestamp", 
        default: () => "CURRENT_TIMESTAMP(6)"
        })
    created_at!: Date;

    @DeleteDateColumn({
        name: 'Data_Hora_Delecao',
        type: 'datetime',
        nullable: true
    })
    deletedAt?: Date

    @ManyToOne(() => Establishment, (establishment) => establishment.subscriptions)
    @JoinColumn({
        name: 'ID_Estabelecimento'
    })
    establishment?: Establishment

    @ManyToOne(() => Plan, (plan) => plan.subscriptions)
    @JoinColumn({
        name: 'ID_Plano'
    })
    plan?: Plan
    
}