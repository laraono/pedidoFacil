import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './Product';
import { Establishment } from './Establishment';

@Entity({ name: 'CATEGORIA' })
export class Category {
  @PrimaryGeneratedColumn({
    name: 'ID_Categoria',
  })
  id!: number;

  @Column({
    type: 'varchar',
    name: 'Nome',
    nullable: false,
    length: 50,
  })
  name!: string;

  @Column({
    type: 'varchar',
    name: 'Imagem',
    nullable: true,
  })
  image?: string;

  @Column({
    type: 'boolean',
    name: 'Ativo',
    nullable: false,
    default: true,
  })
  ativo!: boolean;

  @DeleteDateColumn({
    name: 'Data_Exclusao',
    type: 'timestamp',
    nullable: true,
  })
  deletedAt?: Date;

  @OneToMany(() => Product, (product) => product.category)
  products!: Product[];

  @ManyToOne(() => Establishment, (establishment) => establishment.categories)
  @JoinColumn({
    name: 'ID_Estabelecimento',
  })
  establishment!: Establishment;
}
