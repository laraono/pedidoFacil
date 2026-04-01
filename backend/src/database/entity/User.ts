import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { UserStatus } from '../../enum';
import { Establishment } from './Establishment';
import { Role } from './Role';
import { StorageMovimentation } from './StorageMovimentation';
import { Payment } from './Payment';

@Entity({ name: 'USUARIO' })
export class User {
  @PrimaryGeneratedColumn({
    name: 'ID_Usuario',
  })
  id: number;

  @Column({
    type: 'varchar',
    name: 'Nome',
    nullable: false,
    length: 100,
  })
  name: string;

  @Column({
    type: 'varchar',
    name: 'Email',
    nullable: false,
    length: 100,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    name: 'Senha',
    nullable: false,
  })
  password: string;

  @Column({
    type: 'varchar',
    name: 'Status',
    nullable: false,
    default: UserStatus.PENDENTE,
  })
  status: UserStatus;

  @Column({
    type: 'varchar',
    name: 'CPF',
    nullable: true,
    length: 14,
    unique: true,
  })
  cpf: string;

  @ManyToOne(() => Establishment, (establishment) => establishment.users)
  @JoinColumn({
    name: 'ID_Estabelecimento',
  })
  establishment: Establishment;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({
    name: 'ID_Cargo',
  })
  role: Role;

  @OneToMany(
    () => StorageMovimentation,
    (movimentation) => movimentation.storageIten,
  )
  movimentations: StorageMovimentation[];

  @OneToMany(() => Payment, (payments) => payments.user)
  payments: Payment[];

}
