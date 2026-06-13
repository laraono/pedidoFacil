import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    OneToMany,
    ManyToMany,
    JoinTable,
    DeleteDateColumn
} from "typeorm"
import { Establishment } from "./Establishment"
import { User } from "./User"
import { Permissao } from "./Permissao"

@Entity({ name: 'CARGO' })
export class Role {

    @PrimaryGeneratedColumn({
        name: 'ID_Cargo'
    })
    id!: number

    @Column({
        type: 'varchar',
        name: 'Nome',
        nullable: false,
        length: 50
    })
    name!: string

    @ManyToMany(() => Permissao, { eager: true })
    @JoinTable({
        name: 'CARGO_PERMISSAO',
        joinColumn: { name: 'ID_Cargo', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'Nome_Permissao', referencedColumnName: 'name' }
    })
    permissions!: Permissao[]

    @DeleteDateColumn({
        name: 'Data_Exclusao',
        type: 'timestamp',
        nullable: true
    })
    deletedAt?: Date

    @ManyToOne(() => Establishment, (establishment) => establishment.roles)
    @JoinColumn({
        name: 'ID_Estabelecimento'
    })
    establishment!: Establishment

    @OneToMany(() => User, (user) => user.role)
    users!: User[]
}