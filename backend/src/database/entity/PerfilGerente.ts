import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from "typeorm"
import { User } from "./User"

@Entity({ name: 'PERFIL_GERENTE' })
export class PerfilGerente {

    @PrimaryColumn({ name: 'ID_Usuario', type: 'int' })
    id!: number

    @Column({ type: 'varchar', name: 'CPF', nullable: true, length: 14, unique: true })
    cpf!: string | null

    @Column({ type: 'varchar', name: 'Endereco', nullable: true, length: 255 })
    address!: string | null

    @Column({ type: 'varchar', name: 'Cidade', nullable: true, length: 100 })
    city!: string | null

    @Column({ type: 'varchar', name: 'Estado', nullable: true, length: 2 })
    state!: string | null

    @Column({ type: 'varchar', name: 'CEP', nullable: true, length: 10 })
    zip!: string | null

    @OneToOne(() => User, (user) => user.perfilGerente)
    @JoinColumn({ name: 'ID_Usuario' })
    user!: User
}
