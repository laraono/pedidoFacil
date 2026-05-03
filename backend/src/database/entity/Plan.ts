import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { UserStatus } from "../../enum"
import { Subscription } from "./Subscription"

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
        type: 'varchar',
        name: 'Frequencia',
        nullable: false,
        length: 100
    })
    frequency!: string

    @Column({
        type: 'varchar',
        name: 'Features',
        nullable: true
    })
    features?: string
    
    @OneToMany(() => Subscription, (subscription) => subscription.establishment)
    subscriptions?: Subscription[]
}