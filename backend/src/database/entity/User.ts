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
import { Role } from './Role';
import { StorageMovimentation } from './StorageMovimentation';
import { Payment } from './Payment';

@Entity({ name: 'USUARIO' })
export class User {
  @PrimaryGeneratedColumn({
    name: 'ID_Usuario',
  })
  id!: number;

  @Column({
    type: 'varchar',
    name: 'Nome',
    nullable: false,
    length: 100,
  })
  name!: string;

  @Column({
    type: 'varchar',
    name: 'Email',
    nullable: false,
    length: 100,
    unique: true,
  })
  email!: string;

  @Column({
    type: 'varchar',
    name: 'Senha',
    nullable: false,
  })
  password!: string;

  @Column({
    type: 'varchar',
    name: 'Status',
    nullable: false,
    default: UserStatus.INATIVO,
  })
  status!: UserStatus;

  @Column({
    type: 'varchar',
    name: 'CPF',
    nullable: true,
    length: 14,
    unique: false,
  })
  cpf!: string | null;

  @Column({
    type: 'varchar',
    name: 'Password_Reset_Token',
    nullable: true,
  })
  passwordResetToken!: string | null;

  @Column({
    type: 'timestamp',
    name: 'Password_Reset_Expires',
    nullable: true,
  })
  passwordResetExpires!: Date | null;

  @Column({ type: 'varchar', name: 'Telefone', nullable: true, length: 20 })
  phone!: string | null;

  @Column({ type: 'varchar', name: 'Endereco', nullable: true, length: 255 })
  address!: string | null;

  @Column({ type: 'varchar', name: 'Cidade', nullable: true, length: 100 })
  city!: string | null;

  @Column({ type: 'varchar', name: 'Estado', nullable: true, length: 2 })
  state!: string | null;

  @Column({ type: 'varchar', name: 'CEP', nullable: true, length: 10 })
  zip!: string | null;

  @DeleteDateColumn({
    name: 'Data_Exclusao',
    type: 'datetime',
    nullable: true,
  })
  deletedAt?: Date;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({
    name: 'ID_Cargo',
  })
  role!: Role;

  @OneToMany(
    () => StorageMovimentation,
    (movimentation) => movimentation.storageIten,
  )
  movimentations!: StorageMovimentation[];

  @OneToMany(() => Payment, (payments) => payments.user)
  payments!: Payment[];
}
