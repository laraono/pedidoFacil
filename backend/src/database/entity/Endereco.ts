import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity({ name: 'ENDERECO' })
export class Endereco {
    @PrimaryGeneratedColumn({ name: 'ID_Endereco' })
    id!: number

    @Column({ type: 'varchar', name: 'Logradouro', nullable: true, length: 255 })
    logradouro?: string | null

    @Column({ type: 'varchar', name: 'Cidade', nullable: true, length: 100 })
    cidade?: string | null

    @Column({ type: 'char', name: 'Estado', nullable: true, length: 2 })
    estado?: string | null

    @Column({ type: 'varchar', name: 'CEP', nullable: true, length: 10 })
    cep?: string | null
}
