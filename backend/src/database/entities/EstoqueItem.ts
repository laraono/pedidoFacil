import { Entity, Column, OneToOne, PrimaryColumn, JoinColumn, OneToMany } from "typeorm"
import { Produto } from "./Produto"
import { MovimentacaoEstoque } from "./MovimentacaoEstoque"

@Entity("ESTOQUE_ITEM")
export class EstoqueItem {

    @PrimaryColumn({
        name: "ID_Produto",
        type: "int"
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
        name: "Unidade_Medida",
        type: "varchar",
        length: 20,
        nullable: false
    })
    unidadeMedida: string
        
    @Column({
        name: "Quantidade_Atual",
        type: 'int', 
        nullable: false,
        default: 0
    })
    quantidade: number

    @Column({
        name: "Quantidade_Disponivel",
        type: "int",
        nullable: true
    })
    quantidadeDisponivel: number

    @OneToOne(() => Produto)
    @JoinColumn({name: "ID_Produto"})
    produto: Produto

    @OneToMany(() => MovimentacaoEstoque, movimentacaoEstoque => movimentacaoEstoque.estoqueItem)
    movimentacaoEstoque: MovimentacaoEstoque[]
}
