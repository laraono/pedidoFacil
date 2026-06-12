import { UserRepository } from '../repository/UserRepository';
import { RoleRepository } from '../repository/RoleRepository';
import { RefreshTokenRepository } from '../repository/RefreshTokenRepository';
import { AppError } from '../middleware/error/AppError';
import { UserStatus } from '../enum';
import * as bcrypt from 'bcrypt';
import { CreateEmployeeDTO } from '../dto/employee/CreateEmployeeDTO';
import { UpdateEmployeeDTO } from '../dto/employee/UpdateEmployeeDTO';

export class EmployeeService {
  constructor(
    private userRepository: UserRepository,
    private roleRepository: RoleRepository,
    private refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async listEmployees(establishmentId: number, status: UserStatus) {
    return await this.userRepository.findEmployeesByEstablishment(establishmentId, status);
  }

  async createEmployee(establishmentId: number, data: CreateEmployeeDTO) {
    const emailExists = await this.userRepository.findOne({ where: { email: data.email } });
    if (emailExists) throw new AppError('Este e-mail já está em uso.', 400);

    const role = await this.roleRepository.findOne({
      where: { id: data.roleId, establishment: { id: establishmentId } as any },
    });
    if (!role) throw new AppError('Cargo não encontrado ou inválido.', 404);

    const newUser = this.userRepository.create({
      name: data.name,
      email: data.email,
      password: await bcrypt.hash(data.password, 10),
      status: UserStatus.ATIVO,
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
        where: { id: data.roleId, establishment: { id: establishmentId } as any },
      });
      if (!role) throw new AppError('Cargo não encontrado.', 404);
      user.role = role;
    }

    if (data.password) user.password = await bcrypt.hash(data.password, 10);
    user.name = data.name || user.name;
    user.email = data.email || user.email;

    await this.userRepository.save(user);
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async deactivateEmployee(establishmentId: number, userId: number) {
    const user = await this.userRepository.findEmployeeByIdAndEstablishment(userId, establishmentId);
    if (!user) throw new AppError('Funcionário não encontrado.', 404);
    if (user.role?.name === 'Gerente') throw new AppError('Não é possível desativar o Gerente principal.', 403);

    user.status = UserStatus.INATIVO;
    await this.userRepository.save(user);
    return { message: 'Funcionário desativado com sucesso.' };
  }

  async reactivateEmployee(establishmentId: number, userId: number) {
    const user = await this.userRepository.findEmployeeByIdAndEstablishment(userId, establishmentId);
    if (!user) throw new AppError('Funcionário não encontrado.', 404);

    user.status = UserStatus.ATIVO;
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