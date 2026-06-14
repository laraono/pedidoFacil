import { DataSource, Not, Repository } from "typeorm";
import { User } from "../database";

export class UserRepository extends Repository<User> {

    constructor(dataSource: DataSource) {
        super(User, dataSource.createEntityManager());
    }

    async findEmployeesByEstablishment(establishmentId: number, ativo: boolean) {
        return await this.find({
            where: { role: { establishment: { id: establishmentId }, name: Not('Gerente') } as any, ativo },
            relations: ['role'],
            select: ['id', 'name', 'email', 'ativo'],
            order: ativo ? { name: 'ASC' } : { id: 'DESC' },
        });
    }

    async findEmployeeByIdAndEstablishment(userId: number, establishmentId: number) {
        return await this.findOne({
            where: { id: userId, role: { establishment: { id: establishmentId } } as any },
            relations: ['role'],
        });
    }
}
