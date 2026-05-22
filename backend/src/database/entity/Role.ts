import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    ManyToOne, 
    JoinColumn, 
    OneToMany, 
    DeleteDateColumn 
} from "typeorm"
import { Establishment } from "./Establishment"
import { User } from "./User"

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

    @Column({
        type: 'json',
        name: 'Permissoes_JSON',
        nullable: true,
    })
    permissions?: string

    @DeleteDateColumn({
        name: 'Data_Exclusao',
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