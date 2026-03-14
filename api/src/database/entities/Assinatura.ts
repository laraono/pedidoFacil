import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { Plano } from "./Plano"
import { Estabelecimento } from "./Estabelecimento"

@Entity("ASSINATURA")
export class Assinatura {

    @PrimaryGeneratedColumn({
        name: "ID_Assinatura"
    })
    idAssinatura: number

    @Column({
        name: "Data_Inicio",
        type: "date",
        nullable: false
    })
    dataInicio: Date
        
    @Column({
        name: "Data_Vencimento_Prox", // Changed: Different column name
        type: "date",
        nullable: false
    })
    dataVencimentoProx: Date

    @Column({
        name: "Status",
        type: "varchar",
        length: 18,
        nullable: false // Added: Should probably not be nullable
    })
    status: string 

    @Column({
        name: "Ultima_Data_Pagamento",
        type: "date",
        nullable: true
    })
    ultimaDataPagamento: string

    @Column({
        name: "Recibo_URL", // Changed: column name
        type: "varchar",
        nullable: true
    })
    reciboUrl: string

    @ManyToOne(() => Plano, plano => plano.assinaturas) // Added inverse relation
    @JoinColumn({name: "ID_Plano"})
    plano: Plano

    @ManyToOne(() => Estabelecimento, estabelecimento => estabelecimento.assinaturas) // Added inverse relation
    @JoinColumn({name: "ID_Estabelecimento"})
    estabelecimento: Estabelecimento
}