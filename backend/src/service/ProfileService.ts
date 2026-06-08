import { UserRepository } from '../repository/UserRepository';
import { RefreshTokenRepository } from '../repository/RefreshTokenRepository';
import { AppError } from '../middleware/error/AppError';
import * as bcrypt from 'bcrypt';
import { EstablishmentService } from './EstablishmentService';
import { UpdateProfileDTO } from '../dto/profile/UpdateProfileDTO';
import { ChangePasswordDTO } from '../dto/profile/ChangePasswordDTO';

export class ProfileService {
  constructor(
    private userRepository: UserRepository,
    private establishmentService: EstablishmentService,
    private refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: [
        'id',
        'name',
        'email',
        'cpf',
        'phone',
        'address',
        'city',
        'state',
        'zip',
      ],
    });

    if (!user) throw new AppError('Perfil não encontrado.', 404);

    return user;
  }

  async updateProfile(userId: number, data: UpdateProfileDTO) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new AppError('Perfil não encontrado.', 404);

    if (data.email && data.email !== user.email) {
      const emailExists = await this.userRepository.findOne({
        where: { email: data.email },
      });
      if (emailExists)
        throw new AppError('Este e-mail já está em uso por outra conta.', 400);
    }

    if (data.cpf && data.cpf !== user.cpf) {
      const cpfExists = await this.userRepository.findOne({
        where: { cpf: data.cpf },
      });
      if (cpfExists)
        throw new AppError('Este CPF já está cadastrado no sistema.', 400);
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

    if (data.address && data.city && data.state) {
      await this.establishmentService.createStore({
        address: data.address,
        city: data.city,
        state: data.state,
        user,
      });
    }

    return { ...user, ...updateData };
  }

  async changePassword(userId: number, data: ChangePasswordDTO) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new AppError('Perfil não encontrado.', 404);

    const isMatch = await bcrypt.compare(data.oldPassword, user.password);
    if (!isMatch) throw new AppError('A senha atual está incorreta.', 400);

    user.password = await bcrypt.hash(data.newPassword, 12);
    await this.userRepository.save(user);
    await this.refreshTokenRepository.revokeAllByUserId(userId);

    return { message: 'Senha updated com sucesso.' };
  }
}
