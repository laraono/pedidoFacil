import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity({ name: 'TIPO_MOVIMENTACAO' })
export class TipoMovimentacao {
    @PrimaryGeneratedColumn({ name: 'ID_TipoMovimentacao' })
    id!: number

    @Column({ type: 'varchar', name: 'Nome', nullable: false, length: 30 })
    nome!: string
}
