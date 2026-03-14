import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany } from "typeorm"
import { Assinatura } from "./Assinatura"

@Entity("PLANO")
export class Plano {

    @PrimaryGeneratedColumn({
        name: "ID_Plano"
    })
    idPlano: number

    @Column({
        name: "Nome",
        type: "varchar",
        length: 30,
        nullable: false
    })
    nome: string
        
    @Column({
        name: "Valor_Plano",
        type: 'decimal', 
        precision: 10, 
        scale: 2,
        nullable: false
    })
    valorPlano: number

    @OneToMany(() => Assinatura, assinatura => assinatura.plano)
    assinaturas: Assinatura[]
}
