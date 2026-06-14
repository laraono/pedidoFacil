import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne } from "typeorm"
import { StorageIten } from "./StorageIten"
import { User } from "./User"
import { TipoMovimentacao } from "./TipoMovimentacao"

@Entity({ name: 'MOVIMENTACAO_ESTOQUE' })
export class StorageMovimentation {

    @PrimaryGeneratedColumn({ name: 'ID_Movimentacao' })
    id!: number

    @Column({ type: 'varchar', name: 'Justificativa', nullable: true })
    reason?: string

    @Column({ type: 'int', name: 'Quantidade', nullable: false })
    quantity!: number

    @ManyToOne(() => TipoMovimentacao, { eager: true })
    @JoinColumn({ name: 'ID_TipoMovimentacao' })
    type!: TipoMovimentacao

    @ManyToOne(() => StorageIten, (iten) => iten.movimentations)
    @JoinColumn({ name: 'ID_Estoque_Item' })
    storageIten!: StorageIten

    @ManyToOne(() => User, (user) => user.movimentations)
    @JoinColumn({ name: 'ID_Usuario_Responsavel' })
    user!: User
}