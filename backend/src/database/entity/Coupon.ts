import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn, Unique, JoinColumn, ManyToOne } from "typeorm"
import { DiscountType } from "../../enum"
import { Establishment } from "./Establishment"

@Unique('UK_Estabelecimento_Codigo', ['establishment', 'code'])
@Entity({name: 'CUPOM_DESCONTO'})
export class Coupon {

    @PrimaryGeneratedColumn({
        name: 'ID_Cupom'
    })
    id!: number

    @Column({
        type: 'varchar',
        name: 'Codigo',
        nullable: false,
        length: 50
    })
    code!: string

    @Column({
        type: 'varchar',
        name: 'Tipo_Desconto',
        nullable: false,
        length: 20
    })
    type!: DiscountType 

    @Column({
        name: 'Valor_Desconto',
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: false
    })
    value!: number

    @Column({
        type: 'int',
        name: 'Quantidade_Disponivel',
        nullable: true,
    })
    quantity?: number

    @Column({
        type: 'date',
        name: 'Data_Validade',
        nullable: true,
    })
    expirationDate?: String

    @DeleteDateColumn({
        name: 'Data_Exclusao',
        nullable: true,
    })
    deletedAt?: Date

    @ManyToOne(() => Establishment, (establishment) => establishment.coupons)
    @JoinColumn({
        name: 'ID_Estabelecimento'
    })
    establishment?: Establishment
}