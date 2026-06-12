import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity({ name: 'METODO_PAGAMENTO' })
export class PaymentMethod {

    @PrimaryGeneratedColumn({ name: 'ID_MetodoPagamento' })
    id!: number

    @Column({ type: 'varchar', name: 'Nome', nullable: false, length: 50, unique: true })
    name!: string
}
