import { DataSource, Repository } from "typeorm"
import { Role } from "../database"

export class RoleRepository extends Repository<Role> {

    constructor(private dataSource: DataSource) {
        super(Role, dataSource.createEntityManager())
    }

    async getRoleById(id: number) {
        return await this.findOne({
            where: { id }
        })
    }
}
