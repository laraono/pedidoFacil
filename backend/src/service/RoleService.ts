import { AppDataSource } from '../database/data-source';
import { Role } from '../database/entity/Role';
import { User } from '../database/entity/User';
import { AppError } from '../middleware/error/AppError';

export class RoleService {
  private roleRepository = AppDataSource.getRepository(Role);
  private userRepository = AppDataSource.getRepository(User);

  async getRolesByEstablishment(establishmentId: number) {
    return await this.listRoles(establishmentId);
  }
  async listRoles(establishmentId: number) {
    return await this.roleRepository.find({
      where: { establishment: { id: establishmentId } },
      order: { name: 'ASC' }
    });
  }

  async createRole(establishmentId: number, data: { name: string; permissions: string[] }) {
    if (!data.name?.trim()) throw new AppError('O nome do cargo é obrigatório.', 400);

    const existingRole = await this.roleRepository.findOne({
      where: { 
        name: data.name, 
        establishment: { id: establishmentId } 
      }
    });

    if (existingRole) {
      throw new AppError('Já existe um cargo com este nome neste estabelecimento.', 409);
    }

    const role = this.roleRepository.create({
      name: data.name,
      permissions: JSON.stringify(data.permissions || []),
      establishment: { id: establishmentId }
    });

    return await this.roleRepository.save(role);
  }

  async updateRole(roleId: number, establishmentId: number, data: { name?: string; permissions?: string[] }) {
    const role = await this.roleRepository.findOne({
      where: { id: roleId, establishment: { id: establishmentId } }
    });

    if (!role) throw new AppError('Cargo não encontrado ou não pertence ao seu estabelecimento.', 404);

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
      where: { id: roleId, establishment: { id: establishmentId } },
      relations: ['users']
    });

    if (!role) throw new AppError('Cargo não encontrado.', 404);

    const usersCount = await this.userRepository.count({
        where: { role: { id: roleId } }
    });

    if (usersCount > 0) {
      throw new AppError(
        `Não é possível excluir o cargo "${role.name}" porque existem ${usersCount} funcionário(s) vinculado(s) a ele. Reatribua os funcionários antes de excluir.`,
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