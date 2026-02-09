import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, ManyToOne, JoinColumn } from "typeorm"
import { Usuario } from "./Usuario"
import { EstoqueItem } from "./EstoqueItem" 

@Entity("MOVIMENTACAO_ESTOQUE")
export class MovimentacaoEstoque {

    @PrimaryGeneratedColumn({
        name: "ID_Movimentacao"
    })
    idMovimentacao: number

    @Column({
        name: "Quantidade",
        type: 'int',
        nullable: false
    })
    quantidade: number

    @Column({
        name: "Justificativa",
        type: "varchar",
        nullable: true
    })
    justificativa: string

    @Column({
        name: "Tipo_Movimentacao",
        type: "varchar",
        length: 25,
        nullable: true
    })
    tipoMovimentacao: string

    @Column({
        name: "Data_Hora",
        type: "datetime",
        nullable: false
    })
    dataHora: Date

    @ManyToOne(() => EstoqueItem)
    @JoinColumn({name: "ID_Estoque_Item"})
    estoqueItem: EstoqueItem

    @ManyToOne(() => Usuario)
    @JoinColumn({name: "ID_Usuario_Responsavel"})
    usuarioResponsavel: Usuario
}
