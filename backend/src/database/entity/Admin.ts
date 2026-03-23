import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity({name: 'ADMIN'})
export class Admin {

    @PrimaryGeneratedColumn({
        name: 'ID_Admin'
    })
    id: number

    @Column({
        type: 'varchar',
        name: 'Nome',
        nullable: false,
        length: 100
    })
    name: string

    @Column({
        type: 'varchar',
        name: 'Email',
        nullable: false,
        length: 100,
        unique: true
    })
    email: string

    @Column({
        type: 'varchar',
        name: 'Senha',
        nullable: false
    })
    password: string
}