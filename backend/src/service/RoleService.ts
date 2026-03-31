import { AppDataSource } from '../database/data-source'
import { Role } from '../database/entity/Role'
import { AppError } from '../middleware/error/AppError'

export class RoleService {
    private roleRepository = AppDataSource.getRepository(Role)

    async createRole(establishmentId: number, data: Partial<Role>) {
        const role = this.roleRepository.create({
            ...data,
            establishment: { id: establishmentId }
        })
        return await this.roleRepository.save(role)
    }

    async getRolesByEstablishment(establishmentId: number) {
        return await this.roleRepository.find({
            where: { establishment: { id: establishmentId } }
        })
    }

    async softDeleteRole(roleId: number, establishmentId: number) {
        const role = await this.roleRepository.findOne({
            where: { id: roleId, establishment: { id: establishmentId } }
        })

        if (!role) {
            throw new AppError('Cargo não encontrado ou não pertence a este estabelecimento', 404)
        }

        await this.roleRepository.softRemove(role)
        return { message: 'Cargo desativado com sucesso' }
    }
}