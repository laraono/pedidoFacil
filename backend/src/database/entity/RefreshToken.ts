import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { User } from "./User"

@Entity({name: 'REFRESH_TOKEN'})
export class RefreshToken {

    @PrimaryGeneratedColumn({
        name: 'ID_Token'
    })
    id: number

    @Column({
        type: 'varchar',
        name: 'Token_Hash',
        nullable: false,
        unique: true
    })
    tokenHash: string

    @Column({
        type: 'boolean',
        name: 'Revogado',
        default: false
    })
    revoked: boolean

    @Column({
        type: 'datetime',
        name: 'Expires_At',
        nullable: false
    })
    expiresAt: Date

    @ManyToOne(() => User)
    @JoinColumn({
        name: 'ID_Usuario'
    })
    user: User
}
