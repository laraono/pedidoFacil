import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { Estabelecimento } from "./Estabelecimento"
import { Cargo } from "./Cargo"
import { Pedido } from "./Pedido"
import { Pagamento } from "./Pagamento"
import { MovimentacaoEstoque } from "./MovimentacaoEstoque"
import { Comanda } from "./Comanda"

@Entity("USUARIO")
export class Usuario {

    @PrimaryGeneratedColumn({name: "ID_Usuario"})
    idUsuario: number 
        
    @Column({
        type: "varchar",
        length: 100,
        nullable: false
    })
    nome: string
        
    @Column({
        type: "varchar",
        length: 100,
        nullable: false,
        unique: true
    })
    email: string 

    @Column({
        type: "varchar",
        length: 15,
        nullable: false
    })
    cpf: string
        
    @Column({
        type: "varchar",
        nullable: false
    })
    senha: string 
        
    @Column({
        type: "boolean",
        nullable: false
    })
    status: string 
    
    @OneToOne(() => Estabelecimento)
    estabelecimento: Estabelecimento 

    @ManyToOne(() => Cargo)
    @JoinColumn({name: "ID_Cargo"})
    cargo: Cargo 

    @OneToMany(() => Pedido, pedido => pedido.usuarioCancelador)
    pedidos: Pedido[]

    @OneToMany(() => Comanda, comanda => comanda.usuario)
    comandas: Comanda[]

    @OneToMany(() => Pagamento, pagamento => pagamento.caixa)
    pagamentos: Pagamento[]

    @OneToMany(() => MovimentacaoEstoque, movimentacao => movimentacao.usuarioResponsavel)
    movimentacaoEstoque: MovimentacaoEstoque[]
}