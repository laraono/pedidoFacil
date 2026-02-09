import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, JoinColumn } from "typeorm"
import { Pagamento } from "./Pagamento"

@Entity("NOTA_FISCAL")
export class NotaFiscal {

    @PrimaryGeneratedColumn({
        name: "ID_Nota"
    })
    idNota: number
        
    @Column({
        name: "Numero_Nota",
        type: 'varchar', 
        length: 100,
        nullable: false
    })
    numeroNota: string

    @Column({
        name: "CPF_CNPJ_Cliente",
        type: 'varchar', 
        length: 18,
        nullable: true
    })
    cpfNota: string

    @Column({
        name: "Data_Emissao",
        type: "datetime",
        nullable: false
    })
    dataEmissao: Date

    @OneToOne(() => Pagamento)
    @JoinColumn({name: "ID_Pagamento"})
    pagamento: Pagamento

}
