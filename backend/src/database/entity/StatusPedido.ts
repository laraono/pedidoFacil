import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity({ name: 'STATUS_PEDIDO' })
export class StatusPedido {
    @PrimaryGeneratedColumn({ name: 'ID_Status' })
    id!: number

    @Column({ type: 'varchar', name: 'Nome', nullable: false, length: 30 })
    nome!: string
}
