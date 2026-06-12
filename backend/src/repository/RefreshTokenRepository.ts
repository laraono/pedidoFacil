import { DataSource } from "typeorm"
import { RefreshTokenUser } from "../database/entity/RefreshTokenUser"
import { RefreshTokenAdmin } from "../database/entity/RefreshTokenAdmin"
import { User } from "../database/entity/User"
import { Admin } from "../database/entity/Admin"

export class RefreshTokenRepository {
    private userTokenRepo
    private adminTokenRepo

    constructor(dataSource: DataSource) {
        this.userTokenRepo = dataSource.getRepository(RefreshTokenUser)
        this.adminTokenRepo = dataSource.getRepository(RefreshTokenAdmin)
    }

    async findByHash(tokenHash: string) {
        const userToken = await this.userTokenRepo.findOne({
            where: { tokenHash, revoked: false },
            relations: { user: true }
        })
        if (userToken) return userToken

        return await this.adminTokenRepo.findOne({
            where: { tokenHash, revoked: false },
            relations: { admin: true }
        })
    }

    async createToken(user: User, tokenHash: string, expiresAt: Date) {
        const token = this.userTokenRepo.create({ user, tokenHash, expiresAt })
        return await this.userTokenRepo.save(token)
    }

    async createAdminToken(admin: Admin, tokenHash: string, expiresAt: Date) {
        const token = this.adminTokenRepo.create({ admin, tokenHash, expiresAt })
        return await this.adminTokenRepo.save(token)
    }

    async revokeByHash(tokenHash: string) {
        await this.userTokenRepo.update({ tokenHash }, { revoked: true })
        await this.adminTokenRepo.update({ tokenHash }, { revoked: true })
    }

    async revokeAllByUserId(userId: number) {
        await this.userTokenRepo.update({ user: { id: userId } }, { revoked: true })
    }
}
