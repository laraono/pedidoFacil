import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm"
import { Pagamento } from "./Pagamento"
import { Pedido } from "./Pedido"

@Entity("PAGAMENTO_PEDIDO")
export class PagamentoPedido {

    @PrimaryColumn({
        name: "ID_Pagamento"
    })
    idPagamento: number

    @PrimaryColumn({
        name: "ID_Pedido"
    })
    idPedido: number
        
    @Column({
        name: "Valor_Pago_Deste_Pedido",
        type: 'decimal', 
        precision: 10, 
        scale: 2,
        nullable: false
    })
    valorPago: number

    @ManyToOne(() => Pagamento)
    @JoinColumn({name: "ID_Pagamento"})
    pagamento: Pagamento

    @ManyToOne(() => Pedido)
    @JoinColumn({name: "ID_Pedido"})
    pedido: Pedido
}
