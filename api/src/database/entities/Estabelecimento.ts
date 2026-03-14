import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from "typeorm"
import { Usuario } from "./Usuario"
import { Produto } from "./Produto"
import { Categoria } from "./Categoria"
import { Cupom } from "./Cupom"
import { Pedido } from "./Pedido"
import { Pagamento } from "./Pagamento"
import { Assinatura } from "./Assinatura"
import { Configuracao } from "./Configuracao"
import { Cargo } from "./Cargo"
import { Comanda } from "./Comanda"

@Entity("ESTABELECIMENTO")
export class Estabelecimento {

    @PrimaryGeneratedColumn({
        name: "ID_Estabelecimento"
    })
    idEstabelecimento: number

    @Column({
        name: "Nome",
        type: "varchar",
        length: 100,
        nullable: false
    })
    nome: string
        
    @Column({
        name: "CNPJ",
        type: "varchar",
        length: 18,
        nullable: false
    })
    cnpj: string
        
    @Column({
        name: "Status",
        type: "varchar",
        length: 18,
    })
    status: string
    
    @Column({
        name: "Formas_Atendimento_Habilitadas",
        type: "json"
    })
    formaAtentimento: string
    
    @Column({
        name: "Metodos_Pagamento",
        type: "json"
    })
    metodoPagamento: string

    @OneToMany(() => Assinatura, assinatura => assinatura.estabelecimento)
    assinaturas: Assinatura[]

    @OneToMany(() => Cargo, cargo => cargo.estabelecimento)
    cargo: Cargo[]
    
    @OneToMany(() => Comanda, comanda => comanda.estabelecimento)
    comandas: Comanda[]
    
    @OneToOne(() => Usuario)
    @JoinColumn({name: "ID_Gerente_Responsavel"})
    gerente: Usuario

    @OneToOne(() => Configuracao)
    configuracao: Configuracao 

    @OneToMany(() => Produto, produto => produto.estabelecimento)
    produtos: Produto[]

    @OneToMany(() => Categoria, categoria => categoria.estabelecimento)
    categorias: Categoria[]

    @OneToMany(() => Cupom, cupom => cupom.estabelecimento)
    cupons: Cupom[]

    @OneToMany(() => Pedido, pedido => pedido.estabelecimento)
    pedidos: Pedido[]

    @OneToMany(() => Pagamento, pagamento => pagamento.estabelecimento)
    pagamentos: Pagamento[]
}
