import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { SubscriptionStatus, UserStatus } from "../../enum"
import { Plan } from "./Plan"
import { Establishment } from "./Establishment"

@Entity({name: 'ASSINATURA'})
export class Subscription {

    @PrimaryGeneratedColumn({
        name: 'ID_Assinatura'
    })
    id: number

    @Column({
        type: 'date',
        name: 'Data_Inicio',
        nullable: false,
    })
    initialDate: Date

    @Column({
        type: 'date',
        name: 'Data_Vencimento_Prox',
        nullable: false,
    })
    expirationDate: Date

    @Column({
        type: 'varchar',
        name: 'Status',
        nullable: false,
    })
    status: SubscriptionStatus

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

    @ManyToOne(() => Establishment, (establishment) => establishment.subscriptions)
    @JoinColumn({
        name: 'ID_Estabelecimento'
    })
    establishment: Establishment

    @ManyToOne(() => Plan, (plan) => plan.subscriptions)
    @JoinColumn({
        name: 'ID_Plano'
    })
    plan: Plan
    
}