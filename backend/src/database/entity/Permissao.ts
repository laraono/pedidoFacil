import { Entity, PrimaryColumn } from "typeorm"

@Entity({ name: 'PERMISSAO' })
export class Permissao {

    @PrimaryColumn({ type: 'varchar', name: 'Nome', length: 50 })
    name!: string
}
