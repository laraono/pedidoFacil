import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  DeleteDateColumn,
  CreateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { Establishment } from './Establishment';
import { User } from './User';
import { PaymentOrder } from './PaymentOrder';
import { PaymentMethod } from './PaymentMethod';
import { StatusPagamento } from './StatusPagamento';

@Entity({ name: 'PAGAMENTO' })
@Index('idx_pagamento_est_status_data', [
  'establishment',
  'status',
  'createdAt',
])
export class Payment {
  @PrimaryGeneratedColumn({ name: 'ID_Pagamento' })
  id!: number;

  @ManyToOne(() => PaymentMethod)
  @JoinColumn({ name: 'ID_MetodoPagamento' })
  paymentMethod!: PaymentMethod;

  @Column({
    name: 'Valor_Total',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
  })
  totalValue!: number;

  @Column({
    name: 'Troco',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
  })
  change!: number;

  @ManyToOne(() => StatusPagamento, { eager: true })
  @JoinColumn({ name: 'ID_Status' })
  status!: StatusPagamento;

  @CreateDateColumn({ type: 'timestamp', name: 'Data_Hora_Pagamento' })
  createdAt!: Date;

  @Column({ name: 'ID_Pedido_MercadoPago', type: 'varchar', nullable: true })
  mercadoPagoOrderId?: string;

  @Column({ name: 'ID_Pagamento_MercadoPago', type: 'varchar', nullable: true })
  mercadoPagoPaymentId?: string;

  @DeleteDateColumn({
    name: 'Data_Exclusao',
    type: 'timestamp',
    nullable: true,
  })
  deletedAt?: Date;

  @ManyToOne(() => Establishment)
  @JoinColumn({ name: 'ID_Estabelecimento' })
  establishment!: Establishment;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'ID_Usuario_Caixa' })
  user!: User;

  @OneToMany(() => PaymentOrder, (paymentOrder) => paymentOrder.payment)
  paymentOrders!: PaymentOrder[];
}