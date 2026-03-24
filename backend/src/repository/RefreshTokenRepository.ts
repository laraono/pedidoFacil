import { DataSource, Repository } from "typeorm"
import { RefreshToken } from "../database"
import { User } from "../database"

export class RefreshTokenRepository extends Repository<RefreshToken> {

    constructor(private dataSource: DataSource) {
        super(RefreshToken, dataSource.createEntityManager())
    }

    async findByHash(tokenHash: string) {
        return await this.findOne({
            where: { tokenHash, revoked: false },
            relations: { user: true }
        })
    }

    async createToken(user: User, tokenHash: string, expiresAt: Date) {
        const token = this.create({ user, tokenHash, expiresAt })
        return await this.save(token)
    }

    async revokeByHash(tokenHash: string) {
        await this.update({ tokenHash }, { revoked: true })
    }
}
