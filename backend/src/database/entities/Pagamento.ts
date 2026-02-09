import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, ManyToOne, JoinColumn } from "typeorm"
import { Estabelecimento } from "./Estabelecimento"
import { Usuario } from "./Usuario"
import { Cupom } from "./Cupom"
import { PagamentoPedido } from "./PagamentoPedido"
import { NotaFiscal } from "./NotaFiscal"

@Entity("PAGAMENTO")
export class Pagamento {

    @PrimaryGeneratedColumn({
        name: "ID_Pagamento"
    })
    idPagamento: number
        
    @Column({
        name: "Valor_Total",
        type: 'decimal', 
        precision: 10, 
        scale: 2,
        nullable: false
    })
    valorTotal: number

    @Column({
        name: "Valor_Taxa_Servico",
        type: 'decimal', 
        precision: 10, 
        scale: 2,
        nullable: true
    })
    valorTaxaServico?: number

    @Column({
        name: "Troco",
        type: 'decimal', 
        precision: 10, 
        scale: 2,
        nullable: true
    })
    troco?: number

    @Column({
        name: "Forma_Pagamento",
        type: "varchar",
        length: 50,
        nullable: false
    })
    formaPagamento: string

    @Column({
        name: "Data_Hora_Pagamento",
        type: "datetime",
        nullable: false
    })
    dataHoraPagamento: Date

    @ManyToOne(() => Cupom)
    @JoinColumn({name: "ID_Cupom_Aplicado"})
    cupom: Cupom

    @ManyToOne(() => Usuario)
    @JoinColumn({name: "ID_Caixa"})
    caixa: Usuario

    @ManyToOne(() => Estabelecimento)
    @JoinColumn({name: "ID_Estabelecimento"})
    estabelecimento: Estabelecimento

    @OneToMany(() => PagamentoPedido, pagamentoPedido => pagamentoPedido.pagamento)
    pagamentoPedido: PagamentoPedido[]

    @OneToOne(() => NotaFiscal)
    notaFiscal: NotaFiscal
}
