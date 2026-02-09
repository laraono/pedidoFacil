import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from "typeorm"
import { Estabelecimento } from "./Estabelecimento"
import { Usuario } from "./Usuario"
import { Pedido } from "./Pedido"

@Entity("COMANDA")
export class Comanda {

    @PrimaryGeneratedColumn({
        name: "ID_Comanda"
    })
    idComanda: number

    @Column({
        name: "Descricao",
        type: "varchar",
        length: 100,
        nullable: false
    })
    descricao: string
        
    @Column({
        name: "Data_Inicio",
        type: "datetime",
        nullable: false
    })
    dataAbertura: Date

    @Column({
        name: "Status",
        type: "varchar",
        length: 18,
    })
    status: string

    @ManyToOne(() => Usuario, usuario => usuario.comandas)
    @JoinColumn({name: "ID_Usuario_Abertura"})
    usuario: Usuario

    @ManyToOne(() => Estabelecimento, estabelecimento => estabelecimento.comandas)
    @JoinColumn({name: "ID_Estabelecimento"})
    estabelecimento: Estabelecimento

    @OneToMany(() => Pedido, pedido => pedido.comanda)
    pedidos: Pedido[]
}
