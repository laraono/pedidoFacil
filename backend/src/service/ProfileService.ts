import { AppDataSource } from '../database/data-source';
import { User } from '../database/entity/User';
import { AppError } from '../middleware/error/AppError';
import * as bcrypt from 'bcrypt';

export class ProfileService {
  private userRepository = AppDataSource.getRepository(User);

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'name', 'email', 'cpf', 'phone', 'address', 'city', 'state', 'zip'] 
    });
    
    if (!user) throw new AppError('Perfil não encontrado.', 404);
    
    return user;
  }

  async updateProfile(userId: number, data: any) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new AppError('Perfil não encontrado.', 404);

    if (data.email && data.email !== user.email) {
      const emailExists = await this.userRepository.findOne({ where: { email: data.email } });
      if (emailExists) throw new AppError('Este e-mail já está em uso por outra conta.', 400);
    }

    if (data.cpf && data.cpf !== user.cpf) {
      const cpfExists = await this.userRepository.findOne({ where: { cpf: data.cpf } });
      if (cpfExists) throw new AppError('Este CPF já está cadastrado no sistema.', 400);
    }

    const updateData = {
      name: data.name || user.name,
      email: data.email || user.email,
      cpf: data.cpf !== undefined ? data.cpf : user.cpf,
      phone: data.phone !== undefined ? data.phone : user.phone,
      address: data.address !== undefined ? data.address : user.address,
      city: data.city !== undefined ? data.city : user.city,
      state: data.state !== undefined ? data.state : user.state,
      zip: data.zip !== undefined ? data.zip : user.zip,
    };

    await this.userRepository.update(userId, updateData);
    
    return { ...user, ...updateData };
  }

  async changePassword(userId: number, data: any) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new AppError('Perfil não encontrado.', 404);

    const isMatch = await bcrypt.compare(data.oldPassword, user.password);
    if (!isMatch) throw new AppError('A senha atual está incorreta.', 400);

    user.password = await bcrypt.hash(data.newPassword, 10);
    await this.userRepository.save(user);

    return { message: 'Senha atualizada com sucesso.' };
  }
}