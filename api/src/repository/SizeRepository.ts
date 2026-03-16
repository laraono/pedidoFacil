import { DataSource, Repository } from "typeorm";
import { CreateSize } from "../dto";
import { Size } from "../database";

export class SizeRepository extends Repository<Size>{

    constructor(private dataSource: DataSource) {
        super(Size, dataSource.createEntityManager());
    }

    async createSize(size: CreateSize) {
        return await this.save(size)
    }

    async getSize(sizeId: number) {
        return await this.findOne( {
            where: {
                id: sizeId
            }
        })
    }

    async getSizesByProduct(productId: number) {
        
    }
    
}