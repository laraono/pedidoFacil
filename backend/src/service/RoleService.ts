import { RoleRepository } from '../repository/RoleRepository';
import { UserRepository } from '../repository/UserRepository';
import { AppError } from '../middleware/error/AppError';
import { CreateRoleDTO, UpdateRoleDTO } from '../dto/role/RoleDTO';

export class RoleService {
    constructor(
        private roleRepository: RoleRepository,
        private userRepository: UserRepository
    ) {}

    async listRoles(establishmentId: number) {
        return await this.roleRepository.find({
            where: { establishment: { id: establishmentId } as any },
            order: { name: 'ASC' }
        });
    }

    async createRole(establishmentId: number, data: CreateRoleDTO) {
        const existingRole = await this.roleRepository.findOne({
            where: { 
                name: data.name, 
                establishment: { id: establishmentId } as any
            }
        });

        if (existingRole) {
            throw new AppError('Já existe um cargo com este nome neste estabelecimento.', 409);
        }

        const role = this.roleRepository.create({
            name: data.name,
            permissions: JSON.stringify(data.permissions),
            establishment: { id: establishmentId } as any
        });

        return await this.roleRepository.save(role);
    }

    async updateRole(roleId: number, establishmentId: number, data: UpdateRoleDTO) {
        const role = await this.roleRepository.findOne({
            where: { id: roleId, establishment: { id: establishmentId } as any }
        });

        if (!role) throw new AppError('Cargo não encontrado.', 404);

        if (role.name === 'Gerente' && data.name && data.name !== 'Gerente') {
            throw new AppError('O nome do cargo mestre "Gerente" não pode ser alterado.', 400);
        }

        this.roleRepository.merge(role, {
            name: data.name || role.name,
            permissions: data.permissions ? JSON.stringify(data.permissions) : role.permissions
        });

        return await this.roleRepository.save(role);
    }

    async deleteRole(roleId: number, establishmentId: number) {
        const role = await this.roleRepository.findOne({
            where: { id: roleId, establishment: { id: establishmentId } as any },
            relations: ['users']
        });

        if (!role) throw new AppError('Cargo não encontrado.', 404);

        const usersCount = await this.userRepository.count({
            where: { role: { id: roleId } }
        });

        if (usersCount > 0) {
            throw new AppError(
                `Não é possível excluir o cargo "${role.name}" porque existem funcionário(s) vinculado(s).`,
                400
            );
        }

        if (role.name === 'Gerente') {
            throw new AppError('O cargo principal de Gerente não pode ser removido.', 403);
        }

        await this.roleRepository.softRemove(role);
        return { message: 'Cargo removido com sucesso.' };
    }
}