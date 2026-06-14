import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity({ name: 'STATUS_HISTORICO_ASSINATURA' })
export class StatusHistoricoAssinatura {
    @PrimaryGeneratedColumn({ name: 'ID_Status' })
    id!: number

    @Column({ type: 'varchar', name: 'Nome', nullable: false, length: 30 })
    nome!: string
}
