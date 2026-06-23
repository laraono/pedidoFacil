import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    OneToMany,
    ManyToMany,
    ManyToOne,
    JoinTable,
    DeleteDateColumn
} from "typeorm"
import { User } from "./User"
import { Role } from "./Role"
import { Subscription } from "./Subscription"
import { Category } from "./Category"
import { Coupon } from "./Coupon"
import { Comanda } from "./Comanda"
import { Payment } from "./Payment"
import { Configuration } from "./Configuration"
import { Register } from "./Register"
import { PaymentMethod } from "./PaymentMethod"
import { Endereco } from "./Endereco"

@Entity({ name: 'ESTABELECIMENTO' })
export class Establishment {

    @PrimaryGeneratedColumn({
        name: 'ID_Estabelecimento'
    })
    id!: number

    @Column({
        type: 'varchar',
        name: 'Nome',
        nullable: false,
        length: 100
    })
    name!: string

    @Column({
        type: 'varchar',
        name: 'CNPJ',
        nullable: false,
        length: 18,
        unique: true
    })
    cnpj!: string

    @Column({
        type: 'varchar',
        name: 'Telefone',
        nullable: true,
        length: 20
    })
    phone?: string

    @ManyToOne(() => Endereco, { eager: true, nullable: true })
    @JoinColumn({ name: 'ID_Endereco' })
    endereco?: Endereco | null

    @ManyToMany(() => PaymentMethod)
    @JoinTable({
        name: 'ESTABELECIMENTO_METODO_PAGAMENTO',
        joinColumn: { name: 'ID_Estabelecimento', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'ID_MetodoPagamento', referencedColumnName: 'id' }
    })
    paymentMethods!: PaymentMethod[]

    @Column({
        type: 'varchar',
        name: 'Codigo_Autoatendimento',
        nullable: true,
        length: 10,
        unique: true
    })
    selfServiceCode?: string

    @Column({
        type: 'boolean',
        name: 'Tem_Autoatendimento',
        nullable: false,
        default: false
    })
    temAutoatendimento!: boolean

    @Column({
        type: 'varchar',
        name: 'Mercado_Pago_Id',
        nullable: true,
    })
    mercadoPagoId?: string

    @DeleteDateColumn({
        name: 'Data_Exclusao',
        type: 'timestamp',
        nullable: true
    })
    deletedAt?: Date

    @OneToOne(() => User)
    @JoinColumn({
        name: 'ID_Gerente_Responsavel'
    })
    manager!: User

    @OneToOne(() => Configuration, (config) => config.establishment, { cascade: true, eager: true })
    configurations!: Configuration

    @OneToMany(() => Role, (role) => role.establishment)
    roles!: Role[]

    @OneToOne(() => Subscription, (subscription) => subscription.establishment)
    subscription!: Subscription

    @OneToMany(() => Category, (category) => category.establishment)
    categories!: Category[]

    @OneToMany(() => Coupon, (coupon) => coupon.establishment)
    coupons!: Coupon[]

    @OneToMany(() => Comanda, (comanda) => comanda.establishment)
    comandas!: Comanda[]

    @OneToMany(() => Payment, (payment) => payment.establishment)
    payments!: Payment[]

    @OneToMany(() => Register, (register) => register.establishment)
    registers!: Register[]
}
