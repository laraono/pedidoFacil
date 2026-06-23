import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity({ name: 'STATUS_NOTA_FISCAL' })
export class StatusNotaFiscal {
    @PrimaryGeneratedColumn({ name: 'ID_Status' })
    id!: number

    @Column({ type: 'varchar', name: 'Nome', nullable: false, length: 30 })
    nome!: string
}
