import { DataSource, Repository } from "typeorm"
import { RefreshToken } from "../database"
import { User } from "../database"
import { Admin } from "../database/entity/Admin"

export class RefreshTokenRepository extends Repository<RefreshToken> {

    constructor(private dataSource: DataSource) {
        super(RefreshToken, dataSource.createEntityManager())
    }

    async findByHash(tokenHash: string) {
        return await this.findOne({
            where: { tokenHash, revoked: false },
            relations: { user: true, admin: true }
        })
    }

    async createToken(user: User, tokenHash: string, expiresAt: Date) {
        const token = this.create({ user, admin: null, tokenHash, expiresAt })
        return await this.save(token)
    }

    async createAdminToken(admin: Admin, tokenHash: string, expiresAt: Date) {
        const token = this.create({ user: null, admin, tokenHash, expiresAt })
        return await this.save(token)
    }

    async revokeByHash(tokenHash: string) {
        await this.update({ tokenHash }, { revoked: true })
    }

    async revokeAllByUserId(userId: number) {
        await this.update({ user: { id: userId }, revoked: false }, { revoked: true })
    }
}
