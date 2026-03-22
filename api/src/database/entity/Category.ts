import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { Product } from "./Product"
@Entity({name: 'Categoria'})
export class Category {

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

    @OneToMany(() => Product, (product) => product.category)
    products: Product[]
}