import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm"
import { Subscription } from "./Subscription"
import { StatusHistoricoAssinatura } from "./StatusHistoricoAssinatura"

@Entity({ name: 'HISTORICO_PAGAMENTO_ASSINATURA' })
export class SubscriptionPayment {

    @PrimaryGeneratedColumn({ name: 'ID_Historico' })
    id!: number

    @Column({ name: 'ID_MP_Pagamento', type: 'varchar', length: 255, unique: true })
    mercadoPagoPaymentId!: string

    @Column({ name: 'Valor', type: 'decimal', precision: 10, scale: 2 })
    amount!: number

    @ManyToOne(() => StatusHistoricoAssinatura, { eager: true })
    @JoinColumn({ name: 'ID_Status' })
    status!: StatusHistoricoAssinatura

    @Column({ name: 'Tipo_Pagamento', type: 'varchar', length: 50, nullable: true })
    paymentType?: string

    @Column({ name: 'Nome_Plano', type: 'varchar', length: 255 })
    planName!: string

    @Column({ name: 'Data_Pagamento', type: 'datetime', nullable: true })
    paidAt?: Date

    @CreateDateColumn({ name: 'Data_Criacao', type: 'timestamp' })
    createdAt!: Date

    @ManyToOne(() => Subscription)
    @JoinColumn({ name: 'ID_Assinatura' })
    subscription!: Subscription
}