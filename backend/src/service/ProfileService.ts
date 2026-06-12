import { UserRepository } from '../repository/UserRepository';
import { RefreshTokenRepository } from '../repository/RefreshTokenRepository';
import { AppError } from '../middleware/error/AppError';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDTO } from '../dto/profile/UpdateProfileDTO';
import { ChangePasswordDTO } from '../dto/profile/ChangePasswordDTO';
import { PerfilGerente } from '../database/entity/PerfilGerente';
import { User } from '../database/entity/User';

export class ProfileService {
  constructor(
    private userRepository: UserRepository,
    private refreshTokenRepository: RefreshTokenRepository,
  ) {}

  private async findGerente(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { role: true },
    });
    if (!user) throw new AppError('Perfil não encontrado.', 404);
    if (user.role?.name !== 'Gerente') throw new AppError('Acesso negado.', 403);
    return user;
  }

  async getProfile(userId: number) {
    const user = await this.findGerente(userId);
    const pg = user.perfilGerente;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      cpf: pg?.cpf ?? null,
      address: pg?.address ?? null,
      city: pg?.city ?? null,
      state: pg?.state ?? null,
      zip: pg?.zip ?? null,
    };
  }

  async updateProfile(userId: number, data: UpdateProfileDTO) {
    const user = await this.findGerente(userId);

    if (data.email && data.email !== user.email) {
      const emailExists = await this.userRepository.findOne({ where: { email: data.email } });
      if (emailExists) throw new AppError('Este e-mail já está em uso por outra conta.', 400);
    }

    if (data.cpf && data.cpf !== (user.perfilGerente?.cpf ?? null)) {
      const cpfExists = await this.userRepository.manager.findOne(PerfilGerente, { where: { cpf: data.cpf } });
      if (cpfExists && cpfExists.id !== userId)
        throw new AppError('Este CPF já está cadastrado no sistema.', 400);
    }

    const perfilPatch = {
      cpf:     data.cpf     !== undefined ? data.cpf     : (user.perfilGerente?.cpf     ?? null),
      address: data.address !== undefined ? data.address : (user.perfilGerente?.address ?? null),
      city:    data.city    !== undefined ? data.city    : (user.perfilGerente?.city    ?? null),
      state:   data.state   !== undefined ? data.state   : (user.perfilGerente?.state   ?? null),
      zip:     data.zip     !== undefined ? data.zip     : (user.perfilGerente?.zip     ?? null),
    };

    await this.userRepository.manager.transaction(async (em) => {
      await em.update(User, userId, {
        name:  data.name  ?? user.name,
        email: data.email ?? user.email,
        phone: data.phone !== undefined ? data.phone : user.phone,
      });

      if (user.perfilGerente) {
        await em.update(PerfilGerente, { id: userId }, perfilPatch);
      } else {
        await em.insert(PerfilGerente, { id: userId, user: { id: userId }, ...perfilPatch });
      }
    });

    return await this.getProfile(userId);
  }

  async changePassword(userId: number, data: ChangePasswordDTO) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new AppError('Perfil não encontrado.', 404);

    const isMatch = await bcrypt.compare(data.oldPassword, user.password);
    if (!isMatch) throw new AppError('A senha atual está incorreta.', 400);

    user.password = await bcrypt.hash(data.newPassword, 12);
    await this.userRepository.save(user);
    await this.refreshTokenRepository.revokeAllByUserId(userId);

    return { message: 'Senha atualizada com sucesso.' };
  }
}
