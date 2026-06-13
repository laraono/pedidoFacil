import { DataSource, Not, Repository } from "typeorm";
import { User } from "../database";
import { UserStatus } from "../enum";

export class UserRepository extends Repository<User> {

    constructor(dataSource: DataSource) {
        super(User, dataSource.createEntityManager());
    }

    async findEmployeesByEstablishment(establishmentId: number, status: UserStatus) {
        return await this.find({
            where: { role: { establishment: { id: establishmentId }, name: Not('Gerente') } as any, status },
            relations: ['role'],
            select: ['id', 'name', 'email', 'status'],
            order: status === UserStatus.ATIVO ? { name: 'ASC' } : { id: 'DESC' },
        });
    }

    async findEmployeeByIdAndEstablishment(userId: number, establishmentId: number) {
        return await this.findOne({
            where: { id: userId, role: { establishment: { id: establishmentId } } as any },
            relations: ['role'],
        });
    }
}
