import { DataSource, Repository } from "typeorm";
import { Role } from "../database";

export class RoleRepository extends Repository<Role> {

    constructor(dataSource: DataSource) {
        super(Role, dataSource.createEntityManager());
    }

    async getRoleById(id: number) {
        return await this.findOne({
            where: { id },
            relations: { permissions: true }
        });
    }

    async saveMany(roles: any[]) {
        return await this.save(roles);
    }
}