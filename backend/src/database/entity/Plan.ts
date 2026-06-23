import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { Subscription } from "./Subscription"
import { PlanFeature } from "./PlanFeature"

@Entity({name: 'PLANO'})
export class Plan {

    @PrimaryGeneratedColumn({
        name: 'ID_Plano'
    })
    id!: number

    @Column({
        type: 'varchar',
        name: 'Nome',
        nullable: false,
        length: 100
    })
    name!: string

    @Column({
        name: 'Valor_Plano',
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: false
    })
    price!: number

    @Column({
        name: 'Frequencia',
        type: 'varchar',
        nullable: true,
        length: 20
    })
    frequency?: string

    @Column({
        name: 'ID_MercadoPago_Plano',
        type: 'varchar',
        length: 255,
        nullable: true
    })
    mercadoPagoId?: string

    @OneToMany(() => Subscription, (subscription) => subscription.plan)
    subscriptions!: Subscription[]

    @OneToMany(() => PlanFeature, (feature) => feature.plan, { cascade: true, eager: true })
    features!: PlanFeature[]
}
