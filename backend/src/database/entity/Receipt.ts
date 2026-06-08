import { 
    Entity, PrimaryGeneratedColumn, Column, OneToOne, 
    JoinColumn, ManyToOne, DeleteDateColumn, CreateDateColumn 
} from "typeorm";
import { Payment } from "./Payment";
import { Establishment } from "./Establishment";
import { ReceiptStatus } from '../../enum';

@Entity({ name: 'NOTA_FISCAL' })
export class Receipt {
    @PrimaryGeneratedColumn({ name: 'ID_Nota' })
    id!: number;

    @Column({ type: 'varchar', name: 'Numero_Nota', length: 50 })
    receiptNumber!: string;

    @Column({ type: 'varchar', name: 'CPF_CNPJ_Cliente', nullable: true, length: 18 })
    cpfcnpj!: string | null; 

    @Column({
        type: 'enum',
        enum: ReceiptStatus,
        default: ReceiptStatus.AUTORIZADA,
        name: 'Status'
    })
    status!: ReceiptStatus;

    @Column({ type: 'decimal', precision: 10, scale: 2, name: 'Valor_Total' })
    totalValue!: number;

    @CreateDateColumn({ name: 'Data_Emissao' })
    createdAt!: Date;

    @DeleteDateColumn({ name: 'Data_Exclusao', nullable: true })
    deletedAt?: Date | null; 

    @OneToOne(() => Payment)
    @JoinColumn({ name: 'ID_Pagamento' })
    payment!: Payment;

    @ManyToOne(() => Establishment)
    @JoinColumn({ name: 'ID_Estabelecimento' })
    establishment!: Establishment;
}