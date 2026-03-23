import { DataSource, Repository } from "typeorm";
import { User } from "../database";

export class UserRepository extends Repository<User>{

    constructor(private dataSource: DataSource) {
        super(User, dataSource.createEntityManager());
    }

    async getUser(userId: number) {
        return await this.findOne({
            where: {
                id: userId
            }
        })
    }
    
}