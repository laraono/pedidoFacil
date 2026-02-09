import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, ManyToOne, JoinColumn } from "typeorm"
import { Estabelecimento } from "./Estabelecimento"
import { Categoria } from "./Categoria"
import { EstoqueItem } from "./EstoqueItem"
import { ItemPedido } from "./ItemPedido"

@Entity("PRODUTO")
export class Produto {

    @PrimaryGeneratedColumn({
        name: "ID_Produto"
    })
    idProduto: number

    @Column({
        name: "Nome",
        type: "varchar",
        length: 100,
        nullable: false
    })
    nome: string

    @Column({
        name: "Descricao",
        type: "varchar",
        nullable: true
    })
    descricao: string
        
    @Column({
        name: "Preco",
        type: 'decimal', 
        precision: 10, 
        scale: 2,
        nullable: false
    })
    preco: number

    @Column({
        name: "Imagem",
        type: "varchar",
    })
    imagem: string

    @Column({
        name: "Status",
        type: "varchar",
        length: 25,
        nullable: true
    })
    status: string

    @Column({
        name: "Estocavel",
        type: "boolean",
        nullable: false
    })
    estocavel: boolean

    @OneToOne(() => EstoqueItem)
    estoqueItem: EstoqueItem

    @ManyToOne(() => Categoria)
    @JoinColumn({name: "ID_Categoria"})
    categoria: Categoria

    @ManyToOne(() => Estabelecimento)
    @JoinColumn({name: "ID_Estabelecimento"})
    estabelecimento: Estabelecimento

    @OneToMany(() => ItemPedido, itens => itens.produto)
    itensPedido: ItemPedido[]
}
