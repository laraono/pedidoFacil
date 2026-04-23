import { DataSource, Repository } from "typeorm";
import { User } from "../database";

export class UserRepository extends Repository<User> {

    constructor(private dataSource: DataSource) {
        super(User, dataSource.createEntityManager());
    }

    async getUser(userId: number) {
        return await this.findOne({
            where: { id: userId }
        })
    }

    async findByIdWithEstablishment(id: number) {
        return await this.findOne({ where: { id }, relations: ['establishment'] });
    }

    async findByIdWithRelations(id: number) {
        return await this.findOne({ where: { id }, relations: ['establishment', 'role'] });
    }

    async updateEstablishmentId(userId: number, establishmentId: number) {
        await this.update(userId, { establishment: { id: establishmentId } as any });
    }

    async updateRoleId(userId: number, roleId: number) {
        await this.update(userId, { role: { id: roleId } as any });
    }
}