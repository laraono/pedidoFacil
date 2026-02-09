import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, ManyToOne } from "typeorm"
import { Estabelecimento } from "./Estabelecimento"
import { Usuario } from "./Usuario"

@Entity("CARGO")
export class Cargo {

    @PrimaryGeneratedColumn({
        name: "ID_Cargo"
    })
    idCargo: number

    @Column({
        name: "Nome",
        type: "varchar",
        length: 50,
        nullable: false
    })
    nome: string
        
    @Column({
        name: "Permissoes_JSON",
        type: "json",
        nullable: true
    })
    permissoes: string
    
    @ManyToOne(() => Estabelecimento, estabelecimento => estabelecimento.cargo)
    @JoinColumn({name: "ID_Estabelecimento"})
    estabelecimento: Estabelecimento

    @OneToMany(() => Usuario, usuario => usuario.cargo)
    usuarios: Usuario[]
}
