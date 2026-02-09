import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, OneToMany } from "typeorm"
import { Estabelecimento } from "./Estabelecimento"
import { Produto } from "./Produto"

@Entity("CATEGORIA")
export class Categoria {

    @PrimaryGeneratedColumn({
        name: "ID_Categoria"
    })
    idCategoria: number

    @Column({
        name: "Nome",
        type: "varchar",
        length: 100,
        nullable: false
    })
    nome: string

    @ManyToOne(() => Estabelecimento, estabelecimento => estabelecimento.categorias)
    @JoinColumn({name: "ID_Estabelecimento"})
    estabelecimento: Estabelecimento

    @OneToMany(() => Produto, produto => produto.categoria)
    produtos: Produto[]
}
