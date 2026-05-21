import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, OneToOne } from "typeorm"
import { ComandaStatus, DiscountType } from "../../enum"
import { Order } from "./Order"
import { Establishment } from "./Establishment"
import { User } from "./User"
import { Coupon } from "./Coupon"

@Entity({name: 'COMANDA'})
export class Comanda {

    @PrimaryGeneratedColumn({
        name: 'ID_Comanda'
    })
    id!: number

    @Column({
        type: 'varchar',
        name: 'Descricao',
        nullable: false,
        length: 100
    })
    description!: string

    @Column({
        type: 'varchar',
        name: 'Nome_Cliente',
        nullable: true,
        length: 100
    })
    customerName?: string

    @Column({
        type: 'varchar',
        name: 'Status',
        nullable: false,
        length: 30
    })
    status!: ComandaStatus

    @Column({
        name: 'Total',
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: false
    })
    total!: number

    @Column({
        name: 'Valor_Desconto_Aplicado',
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: true
    })
    discountValue?: number

    @Column({
        name: 'Tipo_Desconto_Aplicado',
        type: "varchar",
        length: 30,
        nullable: true
    })
    discountType?: DiscountType

    @CreateDateColumn({ 
        type: "datetime",
        name: 'Data_Abertura' ,
        default: () => "CURRENT_TIMESTAMP(6)"
    })
    created_at!: Date;

    @DeleteDateColumn({
        name: 'deleted_at',
        type: 'datetime',
        nullable: true
    })
    deletedAt?: Date

    @OneToMany(() => Order, (pedido) => pedido.comanda)
    pedidos!: Order[]

    @ManyToOne(() => Establishment, (establishment) => establishment.comandas)
    @JoinColumn({
        name: 'ID_Estabelecimento'
    })
    establishment!: Establishment

    @OneToOne(() => User)
    @JoinColumn({
        name: 'ID_Usuario_Abertura'
    })
    user!: User

    @OneToOne(() => Coupon)
    @JoinColumn({
        name: 'ID_Cupom_Aplicado'
    })
    coupon!: Coupon

}
