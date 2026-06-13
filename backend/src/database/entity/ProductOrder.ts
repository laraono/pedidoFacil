import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, CreateDateColumn, DeleteDateColumn, ManyToOne } from "typeorm"
import { Product } from "./Product"
import { Order } from "./Order"
import { ProductVariation } from "./ProductVariation"

@Entity({name: 'ITEM_PEDIDO'})
export class ProductOrder {

    @PrimaryGeneratedColumn({
        name: 'ID_Item',
        type: 'int'
    })
    id!: number

    @Column({
            name: 'ID_Variacao',
            type: 'int',
            nullable: true
        })
    productVariationId?: number | null

    @Column({
        type: 'varchar',
        name: 'Observacoes_Cliente',
        nullable: true
    })
    observation?: string

    @Column({
        type: 'int',
        name: 'Quantidade',
        nullable: false
    })
    quantity!: number

    @Column({
        name: 'Preco_Unitario_Momento',
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: false
    })
    price!: number

    @CreateDateColumn({
        name: 'Data_Criacao',
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP(6)"
    })
    created_at!: Date;

    @ManyToOne(() => Product, (product) => product.productOrders)
    @JoinColumn({name: 'ID_Produto'})
    product!: Product

    @ManyToOne(() => Order, (order) => order.productOrders)
    @JoinColumn({name: 'ID_Pedido'})
    order!: Order

    @ManyToOne(() => ProductVariation, (productVariation) => productVariation.productOrders, { nullable: true })
    @JoinColumn({name: 'ID_Variacao'})
    productVariation?: ProductVariation | null

}
