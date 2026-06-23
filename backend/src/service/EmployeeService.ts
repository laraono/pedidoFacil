import { DataSource, Not } from 'typeorm';
import { UserRepository } from '../repository/UserRepository';
import { RoleRepository } from '../repository/RoleRepository';
import { RefreshTokenRepository } from '../repository/RefreshTokenRepository';
import { AppError } from '../middleware/error/AppError';
import { Admin } from '../database/entity/Admin';
import * as bcrypt from 'bcrypt';
import { CreateEmployeeDTO } from '../dto/employee/CreateEmployeeDTO';
import { UpdateEmployeeDTO } from '../dto/employee/UpdateEmployeeDTO';

export class EmployeeService {
  constructor(
    private userRepository: UserRepository,
    private roleRepository: RoleRepository,
    private refreshTokenRepository: RefreshTokenRepository,
    private dataSource: DataSource,
  ) {}

  async listEmployees(establishmentId: number, ativo: boolean) {
    return await this.userRepository.findEmployeesByEstablishment(establishmentId, ativo);
  }

  async createEmployee(establishmentId: number, data: CreateEmployeeDTO) {
    const emailExists = await this.userRepository.findOne({ where: { email: data.email } });
    if (emailExists) throw new AppError('Este e-mail já está em uso.', 400);
    const adminEmailExists = await this.dataSource.getRepository(Admin).findOne({ where: { email: data.email } });
    if (adminEmailExists) throw new AppError('Este e-mail já está em uso.', 400);

    const role = await this.roleRepository.findOne({
      where: { id: data.roleId, establishment: { id: establishmentId } as any, name: Not('Gerente') },
    });
    if (!role) throw new AppError('Cargo não encontrado ou inválido.', 404);

    const newUser = this.userRepository.create({
      name: data.name,
      email: data.email,
      password: await bcrypt.hash(data.password, 12),
      ativo: true,
      role,
    });

    await this.userRepository.save(newUser);
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async updateEmployee(establishmentId: number, userId: number, data: UpdateEmployeeDTO) {
    const user = await this.userRepository.findEmployeeByIdAndEstablishment(userId, establishmentId);
    if (!user) throw new AppError('Funcionário não encontrado.', 404);

    if (data.roleId && (!user.role || data.roleId !== user.role.id)) {
      const role = await this.roleRepository.findOne({
        where: { id: data.roleId, establishment: { id: establishmentId } as any, name: Not('Gerente') },
      });
      if (!role) throw new AppError('Cargo não encontrado.', 404);
      user.role = role;
    }

    if (data.password) user.password = await bcrypt.hash(data.password, 12);
    user.name = data.name || user.name;
    if (data.email && data.email !== user.email) {
      const adminEmailExists = await this.dataSource.getRepository(Admin).findOne({ where: { email: data.email } });
      if (adminEmailExists) throw new AppError('Este e-mail já está em uso.', 400);
    }
    user.email = data.email || user.email;

    await this.userRepository.save(user);
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async deactivateEmployee(establishmentId: number, userId: number) {
    const user = await this.userRepository.findEmployeeByIdAndEstablishment(userId, establishmentId);
    if (!user) throw new AppError('Funcionário não encontrado.', 404);
    if (user.role?.name === 'Gerente') throw new AppError('Não é possível desativar o Gerente principal.', 403);

    user.ativo = false;
    await this.userRepository.save(user);
    return { message: 'Funcionário desativado com sucesso.' };
  }

  async reactivateEmployee(establishmentId: number, userId: number) {
    const user = await this.userRepository.findEmployeeByIdAndEstablishment(userId, establishmentId);
    if (!user) throw new AppError('Funcionário não encontrado.', 404);

    user.ativo = true;
    await this.userRepository.save(user);
    return { message: 'Funcionário reativado com sucesso.' };
  }

  async deleteEmployee(establishmentId: number, userId: number) {
    const user = await this.userRepository.findEmployeeByIdAndEstablishment(userId, establishmentId);
    if (!user) throw new AppError('Funcionário não encontrado.', 404);

    await this.refreshTokenRepository.revokeAllByUserId(userId);
    await this.userRepository.softDelete(userId);
    return { message: 'Funcionário excluído com sucesso.' };
  }
}