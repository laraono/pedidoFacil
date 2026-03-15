import { DataSource, Repository } from "typeorm";
import { CreateAddon } from "../dto";
import { Addon } from "../database";

export class AddonRepository extends Repository<Addon>{

    constructor(private dataSource: DataSource) {
        super(Addon, dataSource.createEntityManager());
    }

    async createAddon(addon: CreateAddon) {
        return await this.save(addon)
    }

    async getAddon(addonId: number) {
        return await this.findOne({
            where: {
                id: addonId
            }
        })
    }

    async getAddonsByProduct(productId: number) {
        
    }
    
}