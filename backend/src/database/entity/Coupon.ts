import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn, Unique, JoinColumn, ManyToOne } from "typeorm"
import { Establishment } from "./Establishment"
import { TipoDesconto } from "./TipoDesconto"

@Unique('UK_Estabelecimento_Codigo', ['establishment', 'code'])
@Entity({ name: 'CUPOM_DESCONTO' })
export class Coupon {

    @PrimaryGeneratedColumn({ name: 'ID_Cupom' })
    id!: number

    @Column({ type: 'varchar', name: 'Codigo', nullable: false, length: 50 })
    code!: string

    @ManyToOne(() => TipoDesconto, { eager: true })
    @JoinColumn({ name: 'ID_TipoDesconto' })
    type!: TipoDesconto

    @Column({ name: 'Valor_Desconto', type: "decimal", precision: 10, scale: 2, nullable: false })
    value!: number

    @Column({ type: 'date', name: 'Data_Validade', nullable: true })
    expirationDate?: string | null

    @DeleteDateColumn({ name: 'Data_Exclusao', type: 'timestamp', nullable: true })
    deletedAt!: Date

    @ManyToOne(() => Establishment, (establishment) => establishment.coupons)
    @JoinColumn({ name: 'ID_Estabelecimento' })
    establishment!: Establishment
}