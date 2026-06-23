import { Entity, PrimaryColumn, Column, ManyToOne, OneToOne, JoinColumn } from "typeorm"
import { User } from "./User"
import { Endereco } from "./Endereco"

@Entity({ name: 'PERFIL_GERENTE' })
export class PerfilGerente {

    @PrimaryColumn({ name: 'ID_Usuario', type: 'int' })
    id!: number

    @Column({ type: 'varchar', name: 'CPF', nullable: true, length: 14 })
    cpf?: string | null

    @ManyToOne(() => Endereco, { eager: true, nullable: true })
    @JoinColumn({ name: 'ID_Endereco' })
    endereco?: Endereco | null

    @OneToOne(() => User, (user) => user.perfilGerente)
    @JoinColumn({ name: 'ID_Usuario' })
    user!: User
}
