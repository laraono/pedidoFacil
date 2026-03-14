import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from "typeorm"
import { Estabelecimento } from "./Estabelecimento"

@Entity("CONFIGURACAO_ESTABELECIMENTO")
export class Configuracao {

    @PrimaryColumn({
        name: "ID_Estabelecimento",
        type: "int"
    })
    idEstabelecimento: number

    @Column({
        name: "Cor_Fundo",
        type: "varchar",
        length: 7,
        nullable: true
    })
    corFundo: string
        
    @Column({
        name: "Fonte",
        type: "varchar",
        length: 50,
        nullable: true
    })
    fonte: string
        
    @Column({
        name: "Tamanho_Fonte",
        type: "int",
        nullable: true,
    })
    tamanhoFonte: number
    
    @Column({
        name: "Logotipo",
        type: "varchar"
    })
    logotipo: string
    
    @OneToOne(() => Estabelecimento)
    @JoinColumn({name: "ID_Estabelecimento"})
    estabelecimento: Estabelecimento
}
