import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn, OneToMany } from "typeorm"
import { Estabelecimento } from "./Estabelecimento"
import { Pagamento } from "./Pagamento"

@Entity("CUPOM_DESCONTO")
@Index(['estabelecimento', 'codigo'], { unique: true })
export class Cupom {

    @PrimaryGeneratedColumn({
        name: "ID_Cupom"
    })
    idCupom: number

    @Column({
        name: "Codigo",
        type: "varchar",
        length: 50,
        nullable: false
    })
    codigo: string

    @Column({
        name: "Tipo_Desconto",
        type: "varchar",
        length: 20,
        nullable: false
    })
    tipoDesconto: string 
        
    @Column({
        name: "Valor_Desconto",
        type: 'decimal', 
        precision: 10, 
        scale: 2,
        nullable: false
    })
    valorDesconto: number

    @Column({
        name: "Quantidade_Disponivel",
        type: "int",
        nullable: true
    })
    quantidadeDisponivel: number

    @Column({
        name: "Data_Validade",
        type: "date",
        nullable: true
    })
    dataValidade: Date

    @ManyToOne(() => Estabelecimento)
    @JoinColumn({name: "ID_Estabelecimento"})
    estabelecimento: Estabelecimento

    @OneToMany(() => Pagamento, pagamento => pagamento.cupom)
    pagamentos: Pagamento[]
}
