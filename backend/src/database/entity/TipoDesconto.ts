import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity({ name: 'TIPO_DESCONTO' })
export class TipoDesconto {
    @PrimaryGeneratedColumn({ name: 'ID_TipoDesconto' })
    id!: number

    @Column({ type: 'varchar', name: 'Nome', nullable: false, length: 30 })
    nome!: string
}
