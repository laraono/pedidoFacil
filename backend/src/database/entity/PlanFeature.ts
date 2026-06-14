import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { Plan } from './Plan'

@Entity({ name: 'FUNCIONALIDADE_PLANO' })
export class PlanFeature {
    @PrimaryGeneratedColumn({ name: 'ID_Funcionalidade' })
    id!: number

    @Column({ type: 'varchar', name: 'Descricao', nullable: false, length: 255 })
    description!: string

    @ManyToOne(() => Plan, (plan) => plan.features)
    @JoinColumn({ name: 'ID_Plano' })
    plan!: Plan
}
