import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, DeleteDateColumn, CreateDateColumn } from "typeorm"
import { ProductVariation } from "./ProductVariation"
import { Category } from "./Category"
import { ProductOrder } from "./ProductOrder"
import { ProductStatus } from "../../enum"

@Entity({name: 'NOTA_FISCAL'})
export class Receipt {

    @PrimaryGeneratedColumn({
        name: 'ID_Nota'
    })
    id: number

    @Column({
        type: 'varchar',
        name: 'Numero_Nota',
        nullable: false,
        length: 50
    })
    recepitNumber: string

    @Column({
        type: 'varchar',
        name: 'CPF_CNPJ_Cliente',
        nullable: true,
        length: 18
    })
    cpfcnpj: string

    @CreateDateColumn({ 
        type: "datetime", 
        default: () => "CURRENT_TIMESTAMP(6)",
        name: 'Data_Emissao'
     })
    created_at: Date;

}
