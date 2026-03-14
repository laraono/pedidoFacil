import { Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToOne, JoinColumn, OneToMany } from "typeorm"
import { Estabelecimento } from "./Estabelecimento"
import { Usuario } from "./Usuario"
import { Comanda } from "./Comanda"
import { ItemPedido } from "./ItemPedido"
import { PagamentoPedido } from "./PagamentoPedido"

@Entity("PEDIDO")
export class Pedido {

    @PrimaryGeneratedColumn({
        name: "ID_Pedido"
    })
    idPedido: number

    @Column({
        name: "Descricao",
        type: "varchar",
        nullable: true
    })
    descricao : string
        
    @Column({
        name: "Custo_Adicional_Viagem",
        type: 'decimal', 
        precision: 10, 
        scale: 2,
        nullable: false
    })
    custoAdicionalViagem: number

    @Column({
        name: "Observacoes_Geral",
        type: "varchar",
    })
    observacoesGeral: string

    @Column({
        name: "Cancelamento_Geral",
        type: "varchar",
    })
    cancelamentoGeral: string

    @Column({
        name: "Status",
        type: "varchar",
        length: 25,
        nullable: true
    })
    status: string

    @Column({
        name: "Tipo_Atendimento",
        type: "varchar",
        length: 25,
        nullable: true
    })
    tipoAtendimento: string

    @Column({
        name: "Data_Hora_Chegada",
        type: "datetime",
        nullable: false
    })
    dataHoraChegada: Date

    @Column({
        name: "seEntregue",
        type: "int"
    })
    seEntregue: number

    @ManyToOne(() => Comanda)
    @JoinColumn({name: "ID_Comanda"})
    comanda: Comanda

    @ManyToOne(() => Usuario)
    @JoinColumn({name: "ID_Usuario_Cancelador"})
    usuarioCancelador: Usuario

    @ManyToOne(() => Estabelecimento)
    @JoinColumn({name: "ID_Estabelecimento"})
    estabelecimento: Estabelecimento

    @OneToMany(() => ItemPedido, item => item.pedido)
    itensPedido: ItemPedido[]

    @OneToMany(() => PagamentoPedido, pagamentoPedido => pagamentoPedido.pedido)
    pagamentoPedido: PagamentoPedido[]
}
