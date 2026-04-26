import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    OneToOne, 
    JoinColumn, 
    OneToMany, 
    DeleteDateColumn 
} from "typeorm"
import { User } from "./User"
import { Role } from "./Role"
import { Subscription } from "./Subscription"
import { Category } from "./Category"
import { Product } from "./Product"
import { Coupon } from "./Coupon"
import { Comanda } from "./Comanda"
import { Order } from "./Order"
import { Payment } from "./Payment"
import { Configuration } from "./Configuration" 
import { Register } from "./Register"

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

    @Column({
        type: 'varchar',
        name: 'Endereco',
        nullable: true,
        length: 255
    })
    address?: string

    @Column({
        type: 'json',
        name: 'Metodos_Pagamento',
        nullable: true
    })
    paymentMethods?: string

    @Column({
        type: 'boolean',
        name: 'Autoatendimento_Ativo',
        default: false
    })
    selfServiceEnabled?: boolean

    @Column({
        type: 'enum',
        enum: ['Ativo', 'Suspenso'],
        default: 'Ativo',
        name: 'Status'
    })
    status!: string

    @Column({
        type: 'varchar',
        name: 'Codigo_Autoatendimento',
        nullable: true,
        length: 10,
        unique: true
    })
    selfServiceCode?: string

    @Column({
        type: 'json',
        name: 'Formas_Atendimento_Habilitadas',
        nullable: true
    })
    serviceTypes?: string


    @Column({
        type: 'varchar',
        name: 'Mercado_Pago_Id',
        nullable: true
    })
    mercadoPagoId?: string

    @DeleteDateColumn({
        name: 'Data_Exclusao',
        nullable: true
    })
    deletedAt?: Date

    @OneToOne(() => User)
    @JoinColumn({
        name: 'ID_Gerente_Responsavel'
    })
    manager?: User

    @OneToOne(() => Configuration, (config) => config.establishment, { cascade: true, eager: true })
    configurations?: Configuration

    @OneToMany(() => Role, (role) => role.establishment)
    roles?: Role[]

    @OneToMany(() => User, (user) => user.establishment)
    users?: User[]

    @OneToMany(() => Subscription, (subscription) => subscription.establishment)
    subscriptions?: Subscription[]

    @OneToMany(() => Category, (category) => category.establishment)
    categories?: Category[]

    @OneToMany(() => Product, (product) => product.establishment)
    products?: Product[]

    @OneToMany(() => Coupon, (coupon) => coupon.establishment)
    coupons?: Coupon[]

    @OneToMany(() => Comanda, (comanda) => comanda.establishment)
    comandas?: Comanda[]

    @OneToMany(() => Order, (order) => order.establishment)
    orders?: Order[]

    @OneToMany(() => Payment, (payment) => payment.establishment)
    payments?: Payment[]

    @OneToMany(() => Register, (register) => register.establishment)
    registers?: Register[]
}