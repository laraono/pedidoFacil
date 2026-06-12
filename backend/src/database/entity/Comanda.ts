import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, Index } from "typeorm"
import { ComandaStatus, DiscountType } from "../../enum"
import { Order } from "./Order"
import { Establishment } from "./Establishment"
import { Coupon } from "./Coupon"

@Entity({name: 'COMANDA'})
@Index('idx_comanda_est_status_data', ['establishment', 'status', 'created_at'])
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
        type: "timestamp",
        name: 'Data_Abertura' ,
        default: () => "CURRENT_TIMESTAMP(6)"
    })
    created_at!: Date;

    @OneToMany(() => Order, (pedido) => pedido.comanda)
    pedidos!: Order[]

    @ManyToOne(() => Establishment, (establishment) => establishment.comandas)
    @JoinColumn({
        name: 'ID_Estabelecimento'
    })
    establishment!: Establishment


    @ManyToOne(() => Coupon)
    @JoinColumn({
        name: 'ID_Cupom_Aplicado'
    })
    coupon!: Coupon
}
