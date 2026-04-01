import { AppDataSource } from '../database/data-source';
import { User } from '../database/entity/User';
import { Role } from '../database/entity/Role';
import { AppError } from '../middleware/error/AppError';
import { UserStatus } from '../enum';
import * as bcrypt from 'bcrypt';

export class EmployeeService {
  private userRepository = AppDataSource.getRepository(User);
  private roleRepository = AppDataSource.getRepository(Role);

  async listEmployees(establishmentId: number) {
    return await this.userRepository.find({
      where: { establishment: { id: establishmentId }, status: UserStatus.ATIVA },
      relations: ['role'],
      select: ['id', 'name', 'email', 'cpf', 'status'],
      order: { name: 'ASC' }
    });
  }

  async listInactiveEmployees(establishmentId: number) {
    return await this.userRepository.find({
      where: { establishment: { id: establishmentId }, status: UserStatus.INATIVA },
      relations: ['role'],
      select: ['id', 'name', 'email', 'cpf', 'status'],
      order: { id: 'DESC' } 
    });
  }

  async createEmployee(establishmentId: number, data: any) {
    const emailExists = await this.userRepository.findOne({ where: { email: data.email } });
    if (emailExists) throw new AppError('Este e-mail já está em uso.', 400);

    if (data.cpf) {
      const existingUser = await this.userRepository.findOne({ where: { cpf: data.cpf } });
      if (existingUser) {
        if (existingUser.status === UserStatus.INATIVA) {
          throw new AppError('Este CPF pertence a um usuário desativado. Vá na aba "Desativados" para reativá-lo.', 400);
        }
        throw new AppError('Este CPF já está em uso por um funcionário ativo.', 400);
      }
    }

    const role = await this.roleRepository.findOne({ where: { id: data.roleId, establishment: { id: establishmentId } } });
    if (!role) throw new AppError('Cargo não encontrado ou inválido.', 404);

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = this.userRepository.create({
      name: data.name,
      email: data.email,
      cpf: data.cpf,
      password: hashedPassword,
      status: UserStatus.ATIVA,
      role: role,
      establishment: { id: establishmentId }
    });

    await this.userRepository.save(newUser);
    
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async updateEmployee(establishmentId: number, userId: number, data: any) {
    const user = await this.userRepository.findOne({ 
      where: { id: userId, establishment: { id: establishmentId } } 
    });

    if (!user) throw new AppError('Funcionário não encontrado.', 404);

    if (data.cpf && data.cpf !== user.cpf) {
      const cpfExists = await this.userRepository.findOne({ where: { cpf: data.cpf } });
      if (cpfExists && cpfExists.id !== userId) {
        throw new AppError('Este CPF já está sendo usado por outro usuário.', 400);
      }
    }

    if (data.roleId) {
      const role = await this.roleRepository.findOne({ where: { id: data.roleId, establishment: { id: establishmentId } } });
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
      where: { id: userId, establishment: { id: establishmentId } },
      relations: ['role']
    });

    if (!user) throw new AppError('Funcionário não encontrado.', 404);
    
    if (user.role && user.role.name === 'Gerente') {
      throw new AppError('Não é possível excluir o Gerente principal.', 403);
    }

    user.status = UserStatus.INATIVA;
    await this.userRepository.save(user);

    return { message: 'Funcionário desativado com sucesso.' };
  }

  async reactivateEmployee(establishmentId: number, userId: number) {
    const user = await this.userRepository.findOne({ 
      where: { id: userId, establishment: { id: establishmentId } } 
    });

    if (!user) throw new AppError('Funcionário não encontrado.', 404);
    
    user.status = UserStatus.ATIVA;
    await this.userRepository.save(user);

    return { message: 'Funcionário reativado com sucesso.' };
  }
}