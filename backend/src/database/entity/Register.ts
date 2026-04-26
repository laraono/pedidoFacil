import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, DeleteDateColumn, CreateDateColumn } from "typeorm"
import { SubscriptionStatus, UserStatus } from "../../enum"
import { Plan } from "./Plan"
import { Establishment } from "./Establishment"

@Entity({name: 'CAIXA'})
export class Register {

    @PrimaryGeneratedColumn({
        name: 'ID_Assinatura'
    })
    id!: number

    @Column({
        type: 'varchar',
        name: 'Nome',
        nullable: false,
    })
    name!: string

    @Column({
        type: 'varchar',
        name: 'Mercado_Pago_Id',
        nullable: false,
    })
    mercadoPagoId!: string

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

    @ManyToOne(() => Establishment, (establishment) => establishment.registers)
    @JoinColumn({
        name: 'ID_Estabelecimento'
    })
    establishment?: Establishment
    
}