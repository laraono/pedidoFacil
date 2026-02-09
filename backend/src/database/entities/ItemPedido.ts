import { Entity, Column, ManyToOne, PrimaryColumn, JoinColumn } from "typeorm"
import { Produto } from "./Produto"
import { Pedido } from "./Pedido"

@Entity("ITEM_PEDIDO")
export class ItemPedido {

    @PrimaryColumn({
        name: "ID_Item_Pedido",
        type: "int"
    })
    idItemPedido: number

    @Column({
        name: "Observacoes",
        type: "varchar",
        length: 20,
        nullable: true
    })
    observacoes: string
        
    @Column({
        name: "Quantidade",
        type: 'int', 
        nullable: false,
        default: 0
    })
    quantidade: number

    @Column({
        name: "Preco_Unitario_Momento",
        type: 'decimal', 
        precision: 10, 
        scale: 2,
        nullable: false
    })
    precoUnitarioMomento: number

    @ManyToOne(() => Produto)
    @JoinColumn({name: "ID_Produto"})
    produto: Produto

    @ManyToOne(() => Pedido)
    @JoinColumn({name: "ID_Pedido"})
    pedido: Pedido
}
