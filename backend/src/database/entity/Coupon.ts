import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, DeleteDateColumn, Unique, JoinColumn, ManyToOne } from "typeorm"
import { ComandaStatus, DiscountType } from "../../enum"
import { Establishment } from "./Establishment"

@Unique(['id', 'code'])
@Entity({name: 'CUPOM_DESCONTO'})
export class Coupon {

    @PrimaryGeneratedColumn({
        name: 'ID_Cupom'
    })
    id: number

    @Column({
        type: 'varchar',
        name: 'Codigo',
        nullable: false,
        length: 30
    })
    code: string

    @Column({
        type: 'varchar',
        name: 'status',
        nullable: false,
        length: 30
    })
    status: ComandaStatus

    @Column({
        name: 'Valor_Desconto',
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: false
    })
    value: number

    @Column({
        type: 'int',
        name: 'Quantidade_Disponivel',
        nullable: true,
    })
    quantity: number

    @Column({
        type: 'date',
        name: 'Data_Vencimento',
        nullable: true,
    })
    expirationDate: Date

    @Column({
        type: 'varchar',
        name: 'Tipo_Desconto',
        nullable: false,
        length: 20
    })
    type: DiscountType

    @ManyToOne(() => Establishment, (establishment) => establishment.coupons)
    @JoinColumn({
        name: 'ID_Estabelecimento'
    })
    establishment: Establishment

}
