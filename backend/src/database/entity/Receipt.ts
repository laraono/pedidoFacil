import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  DeleteDateColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Payment } from './Payment';
import { StatusNotaFiscal } from './StatusNotaFiscal';

@Entity({ name: 'NOTA_FISCAL' })
export class Receipt {
  @PrimaryGeneratedColumn({ name: 'ID_Nota' })
  id!: number;

  @Column({ type: 'varchar', name: 'Numero_Nota', length: 50 })
  receiptNumber!: string;

  @Column({
    type: 'varchar',
    name: 'CPF_CNPJ_Cliente',
    nullable: true,
    length: 18,
  })
  cpfcnpj!: string | null;

  @ManyToOne(() => StatusNotaFiscal, { eager: true })
  @JoinColumn({ name: 'ID_Status' })
  status!: StatusNotaFiscal;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'Valor_Total' })
  totalValue!: number;

  @CreateDateColumn({ name: 'Data_Emissao', type: 'timestamp' })
  createdAt!: Date;

  @DeleteDateColumn({
    name: 'Data_Exclusao',
    type: 'timestamp',
    nullable: true,
  })
  deletedAt?: Date | null;

  @OneToOne(() => Payment)
  @JoinColumn({ name: 'ID_Pagamento' })
  payment!: Payment;
}