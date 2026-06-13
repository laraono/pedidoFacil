import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { Admin } from "./Admin"

@Entity({ name: 'REFRESH_TOKEN_ADMIN' })
export class RefreshTokenAdmin {

    @PrimaryGeneratedColumn({ name: 'ID_Token' })
    id!: number

    @Column({ type: 'varchar', name: 'Token_Hash', nullable: false, unique: true })
    tokenHash!: string

    @Column({ type: 'boolean', name: 'Revogado', default: false })
    revoked!: boolean

    @Column({ type: 'timestamp', name: 'Expires_At', nullable: false })
    expiresAt!: Date

    @ManyToOne(() => Admin)
    @JoinColumn({ name: 'ID_Admin' })
    admin!: Admin
}