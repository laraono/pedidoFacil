import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from "typeorm"
import { Plan } from "./Plan"
import { Establishment } from "./Establishment"
import { StatusAssinatura } from "./StatusAssinatura"

@Entity({ name: 'ASSINATURA' })
export class Subscription {

    @PrimaryGeneratedColumn({ name: 'ID_Assinatura' })
    id!: number

    @Column({ type: 'date', name: 'Data_Inicio', nullable: false })
    initialDate!: Date

    @Column({ type: 'date', name: 'Data_Vencimento_Prox', nullable: false })
    expirationDate!: Date

    @ManyToOne(() => StatusAssinatura, { eager: true })
    @JoinColumn({ name: 'ID_Status' })
    status!: StatusAssinatura

    @Column({ name: 'ID_MercadoPago', type: 'varchar', nullable: true })
    mercadoPagoId?: string

    @Column({ name: 'Valor', type: 'decimal', precision: 10, scale: 2, nullable: true })
    price?: number

    @OneToOne(() => Establishment, (establishment) => establishment.subscription)
    @JoinColumn({ name: 'ID_Estabelecimento' })
    establishment!: Establishment

    @ManyToOne(() => Plan, (plan) => plan.subscriptions, { nullable: true })
    @JoinColumn({ name: 'ID_Plano' })
    plan?: Plan | null
}
