import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
  DeleteDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { Role } from './Role';
import { StorageMovimentation } from './StorageMovimentation';
import { Payment } from './Payment';
import { PerfilGerente } from './PerfilGerente';

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
    type: 'boolean',
    name: 'Ativo',
    nullable: false,
    default: true,
  })
  ativo!: boolean;

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

  @CreateDateColumn({ name: 'Data_Criacao', type: 'timestamp' })
  createdAt!: Date;

  @DeleteDateColumn({
    name: 'Data_Exclusao',
    type: 'timestamp',
    nullable: true,
  })
  deletedAt?: Date;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({
    name: 'ID_Cargo',
  })
  role!: Role;

  @OneToOne(() => PerfilGerente, (pg) => pg.user, { eager: true })
  perfilGerente?: PerfilGerente;

  @OneToMany(
    () => StorageMovimentation,
    (movimentation) => movimentation.user,
  )
  movimentations!: StorageMovimentation[];

  @OneToMany(() => Payment, (payments) => payments.user)
  payments!: Payment[];
}
