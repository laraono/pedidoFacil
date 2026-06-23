import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Order } from './Order';
import { Establishment } from './Establishment';
import { Coupon } from './Coupon';
import { StatusComanda } from './StatusComanda';
import { TipoDesconto } from './TipoDesconto';

@Entity({ name: 'COMANDA' })
@Index('idx_comanda_est_status_data', ['establishment', 'status', 'created_at'])
export class Comanda {
  @PrimaryGeneratedColumn({ name: 'ID_Comanda' })
  id!: number;

  @Column({ type: 'varchar', name: 'Descricao', nullable: false, length: 100 })
  description!: string;

  @ManyToOne(() => StatusComanda, { eager: true })
  @JoinColumn({ name: 'ID_Status' })
  status!: StatusComanda;

  @Column({
    name: 'Total',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  total!: number;

  @Column({
    name: 'Valor_Desconto_Aplicado',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  discountValue?: number;

  @ManyToOne(() => TipoDesconto, { eager: true, nullable: true })
  @JoinColumn({ name: 'ID_Tipo_Desconto_Aplicado' })
  discountType?: TipoDesconto | null;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'Data_Abertura',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at!: Date;

  @OneToMany(() => Order, (pedido) => pedido.comanda)
  pedidos!: Order[];

  @ManyToOne(() => Establishment, (establishment) => establishment.comandas)
  @JoinColumn({ name: 'ID_Estabelecimento' })
  establishment!: Establishment;

  @ManyToOne(() => Coupon, { nullable: true })
  @JoinColumn({ name: 'ID_Cupom_Aplicado' })
  coupon?: Coupon | null;
}