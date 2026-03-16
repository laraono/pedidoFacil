import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn, DeleteDateColumn } from "typeorm"
import { Product } from "./Product"
import { ProductOrder } from "./ProductOrder"

@Entity({name: 'Tamanho'})
export class Size {

    @PrimaryGeneratedColumn({
        name: 'id'
    })
    id: number

    @Column({
        type: 'varchar',
        name: 'name',
        nullable: false,
        length: 50
    })
    name: string

    @Column({
        name: 'price',
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: false
    })
    price: number

    @CreateDateColumn({ 
        type: "timestamp", 
        default: () => "CURRENT_TIMESTAMP(6)"
        })
    created_at: Date;

    @DeleteDateColumn({
        name: 'deleted_at',
        type: 'datetime',
        nullable: true
    })
    deletedAt?: Date

    @ManyToOne(() => Product, (product) => product.sizes)
    product: Product

    @OneToMany(() => ProductOrder, (productOrders) => productOrders.size)
    productOrders: ProductOrder[]

}
