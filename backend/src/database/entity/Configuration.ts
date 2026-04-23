import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { Establishment } from './Establishment';

@Entity({ name: 'CONFIGURACAO_ESTABELECIMENTO' })
export class Configuration {
  @PrimaryColumn({
    name: 'ID_Estabelecimento',
  })
  id: number;

  @Column({
    type: 'varchar',
    name: 'Cor_Fundo_Geral',
    nullable: true,
    length: 7,
  })
  backgroundColor?: string;

  @Column({
    type: 'varchar',
    name: 'Cor_Cards',
    nullable: true,
    length: 7,
  })
  cardsColor?: string;

  @Column({
    type: 'varchar',
    name: 'Cor_Textos',
    nullable: true,
    length: 7,
  })
  textsColor?: string;

  @Column({
    type: 'varchar',
    name: 'Cor_Botoes',
    nullable: true,
    length: 7,
  })
  buttonsColor?: string;

  @Column({
    type: 'varchar',
    name: 'Texto_Botoes',
    nullable: true,
    length: 7,
  })
  buttonsTextColor?: string;

  @Column({
    type: 'varchar',
    name: 'Cor_Categoria_Ativa',
    nullable: true,
    length: 7,
  })
  activeCateogryColor?: string;

  @Column({
    type: 'varchar',
    name: 'Fonte',
    nullable: true,
    length: 50,
  })
  fontFamily: string;

  @Column({
    type: 'varchar',
    name: 'Label_Comanda',
    nullable: true,
    length: 30,
  })
  comandaLabel: string;

  @Column({
    type: 'longtext',
    name: 'Logotipo',
    nullable: true,
  })
  logo?: string;

  @Column({
    type: 'boolean',
    nullable: false,
    default: true,
    name: 'Permite_Observacoes',
  })
  allowObservations: boolean;

  @OneToOne(() => Establishment)
  @JoinColumn({
    name: 'ID_Estabelecimento',
  })
  establishment: Establishment;
}
