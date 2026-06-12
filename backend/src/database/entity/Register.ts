import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, DeleteDateColumn, CreateDateColumn } from "typeorm"
import { Establishment } from "./Establishment"

@Entity({name: 'CAIXA'})
export class Register {

    @PrimaryGeneratedColumn({
        name: 'ID_Caixa'
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

    @Column({
        type: 'varchar',
        name: 'ID_Terminal',
        nullable: true,
    })
    terminalId?: string

    @CreateDateColumn({ 
        name: 'Data_Criacao',
        type: "timestamp", 
        default: () => "CURRENT_TIMESTAMP(6)"
        })
    created_at!: Date;

    @DeleteDateColumn({
        name: 'Data_Exclusao',
        type: 'timestamp',
        nullable: true
    })
    deletedAt?: Date

    @ManyToOne(() => Establishment, (establishment) => establishment.registers)
    @JoinColumn({
        name: 'ID_Estabelecimento'
    })
    establishment?: Establishment
    
}