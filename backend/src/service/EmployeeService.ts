import { UserRepository } from '../repository/UserRepository';
import { RoleRepository } from '../repository/RoleRepository';
import { AppError } from '../middleware/error/AppError';
import { UserStatus } from '../enum';
import * as bcrypt from 'bcrypt';
import { CreateEmployeeDTO } from '../dto/employee/CreateEmployeeDTO';
import { UpdateEmployeeDTO } from '../dto/employee/UpdateEmployeeDTO';

export class EmployeeService {
  constructor(
    private userRepository: UserRepository,
    private roleRepository: RoleRepository,
  ) {}

  async listEmployees(establishmentId: number) {
    return await this.userRepository.find({
      where: {
        establishment: { id: establishmentId } as any,
        status: UserStatus.ATIVO,
      },
      relations: ['role'],
      select: ['id', 'name', 'email', 'cpf', 'status'],
      order: { name: 'ASC' },
    });
  }

  async listInactiveEmployees(establishmentId: number) {
    return await this.userRepository.find({
      where: {
        establishment: { id: establishmentId } as any,
        status: UserStatus.INATIVO,
      },
      relations: ['role'],
      select: ['id', 'name', 'email', 'cpf', 'status'],
      order: { id: 'DESC' },
    });
  }

  async createEmployee(establishmentId: number, data: CreateEmployeeDTO) {
    const emailExists = await this.userRepository.findOne({
      where: { email: data.email },
    });
    if (emailExists) throw new AppError('Este e-mail já está em uso.', 400);

    if (data.cpf) {
      const existingUser = await this.userRepository.findOne({
        where: { cpf: data.cpf },
      });
      if (existingUser) {
        if (existingUser.status === UserStatus.INATIVO) {
          throw new AppError(
            'Este CPF pertence a um usuário desativado. Vá na aba "Desativados" para reativá-lo.',
            400,
          );
        }
        throw new AppError(
          'Este CPF já está em uso por um funcionário ativo.',
          400,
        );
      }
    }

    const role = await this.roleRepository.findOne({
      where: { id: data.roleId, establishment: { id: establishmentId } as any },
    });
    if (!role) throw new AppError('Cargo não encontrado ou inválido.', 404);

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = this.userRepository.create({
      name: data.name,
      email: data.email,
      cpf: data.cpf,
      password: hashedPassword,
      status: UserStatus.ATIVO,
      role: role,
      establishment: { id: establishmentId } as any,
    });

    await this.userRepository.save(newUser);

    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async updateEmployee(
    establishmentId: number,
    userId: number,
    data: UpdateEmployeeDTO,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId, establishment: { id: establishmentId } as any },
      relations: ['role'],
    });

    if (!user) throw new AppError('Funcionário não encontrado.', 404);

    if (data.cpf && data.cpf !== user.cpf) {
      const cpfExists = await this.userRepository.findOne({
        where: { cpf: data.cpf },
      });
      if (cpfExists && cpfExists.id !== userId) {
        throw new AppError(
          'Este CPF já está sendo usado por outro usuário.',
          400,
        );
      }
    }

    if (data.roleId && (!user.role || data.roleId !== user.role.id)) {
      const role = await this.roleRepository.findOne({
        where: {
          id: data.roleId,
          establishment: { id: establishmentId } as any,
        },
      });
      if (!role) throw new AppError('Cargo não encontrado.', 404);
      user.role = role;
    }

    if (data.password) {
      user.password = await bcrypt.hash(data.password, 10);
    }

    user.name = data.name || user.name;
    user.email = data.email || user.email;
    user.cpf = data.cpf || user.cpf;

    await this.userRepository.save(user);

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async softDeleteEmployee(establishmentId: number, userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId, establishment: { id: establishmentId } as any },
      relations: ['role'],
    });

    if (!user) throw new AppError('Funcionário não encontrado.', 404);

    if (user.role && user.role.name === 'Gerente') {
      throw new AppError('Não é possível excluir o Gerente principal.', 403);
    }

    user.status = UserStatus.INATIVO;
    await this.userRepository.save(user);

    return { message: 'Funcionário desativado com sucesso.' };
  }

  async reactivateEmployee(establishmentId: number, userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId, establishment: { id: establishmentId } as any },
    });

    if (!user) throw new AppError('Funcionário não encontrado.', 404);

    user.status = UserStatus.ATIVO;
    await this.userRepository.save(user);

    return { message: 'Funcionário reativado com sucesso.' };
  }
}
