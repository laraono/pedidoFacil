import { AppDataSource } from '../database/data-source';
import { Establishment } from '../database/entity/Establishment';
import { User } from '../database/entity/User';
import { Configuration } from '../database/entity/Configuration';
import { Role } from '../database/entity/Role';
import { AppError } from '../middleware/error/AppError';
import { ServiceType } from '../enum';
import { gerarTokens } from '../config/crypto';

export class EstablishmentService {
  private establishmentRepository = AppDataSource.getRepository(Establishment);
  private userRepository = AppDataSource.getRepository(User);
  private configRepository = AppDataSource.getRepository(Configuration);
  private roleRepository = AppDataSource.getRepository(Role);

  // Helper para limpar permissões
  private parsePermissions(permissions: any): string[] {
    if (Array.isArray(permissions)) return permissions;
    if (typeof permissions !== 'string' || !permissions) return [];
    if (permissions === 'ALL') return ['ALL'];
    try {
      return JSON.parse(permissions);
    } catch {
      return [permissions];
    }
  }

  // Helper para limpar Tipos de Serviço (Onde deu o erro agora)
  private parseServiceTypes(types: any): string[] {
    if (Array.isArray(types)) return types;
    if (typeof types !== 'string' || !types) return [];
    try {
      return JSON.parse(types);
    } catch {
      // Se for "Autoatendimento" vira ["Autoatendimento"]
      return [types];
    }
  }

  async saveOnboardingStep(userId: number, stepData: Partial<Establishment>) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['establishment'],
    });

    if (!user) throw new AppError('User not found.', 404);

    let establishment = await this.establishmentRepository.findOne({
      where: { manager: { id: userId } },
    });

    if (!establishment) {
      if (stepData.cnpj) {
        const cnpjExists = await this.establishmentRepository.findOne({
          where: { cnpj: stepData.cnpj },
        });
        if (cnpjExists)
          throw new AppError('This CNPJ is already registered.', 400);
      }

      establishment = this.establishmentRepository.create({
        ...stepData,
        manager: user,
      });
    } else {
      this.establishmentRepository.merge(establishment, stepData);
    }

    const saved = await this.establishmentRepository.save(establishment);

    if (!user.establishment || user.establishment.id !== saved.id) {
      await this.userRepository.update(userId, {
        establishment: { id: saved.id },
      });
    }

    await this.ensureDefaultConfiguration(saved.id);
    return saved;
  }

  async finalizeOnboarding(userId: number, rolesToCreate: any[], hasTotem: boolean) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['establishment'],
    });

    if (!user || !user.establishment) {
      throw new AppError('No establishment linked to this user.', 400);
    }

    const establishmentId = user.establishment.id;
    const establishment = await this.getEstablishmentProfile(establishmentId);

    // 1. Cargo Master
    const managerRole = this.roleRepository.create({
      name: 'Gerente',
      permissions: JSON.stringify(['ALL']),
      establishment: { id: establishmentId },
    });
    const savedManagerRole = await this.roleRepository.save(managerRole);

    await this.userRepository.update(userId, {
      role: { id: savedManagerRole.id },
    });

    // 2. Cargos Staff
    if (rolesToCreate && rolesToCreate.length > 0) {
      const roles = rolesToCreate.map((r) => ({
        name: r.label,
        permissions: JSON.stringify(r.permissions),
        establishment: { id: establishmentId },
      }));
      await this.roleRepository.save(roles);
    }

    // 3. Configura Totem (Usando o parser seguro)
    if (hasTotem) {
      const currentTypes = this.parseServiceTypes(establishment.serviceTypes);
      
      if (!currentTypes.includes(ServiceType.AUTOATENDIMENTO)) {
        currentTypes.push(ServiceType.AUTOATENDIMENTO);
        establishment.serviceTypes = JSON.stringify(currentTypes);
        await this.establishmentRepository.save(establishment);
      }
    }

    // 4. Gera Tokens e Perfil Atualizado
    const updatedUser = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['establishment', 'role'],
    });

    if (!updatedUser) throw new AppError('Error retrieving updated user.', 500);

    const { accessToken, refreshToken } = await gerarTokens(updatedUser);

    return { 
      message: 'Onboarding completed successfully.',
      accessToken,
      refreshToken,
      usuario: { id: updatedUser.id, nome: updatedUser.name, email: updatedUser.email },
      cargo: {
        id: updatedUser.role?.id,
        nome: updatedUser.role?.name,
        permissoes: this.parsePermissions(updatedUser.role?.permissions)
      },
      estabelecimentoId: updatedUser.establishment?.id
    };
  }

  async getEstablishmentProfile(establishmentId: number) {
    const establishment = await this.establishmentRepository.findOne({
      where: { id: establishmentId },
      relations: ['manager'],
    });
    if (!establishment) throw new AppError('Establishment not found.', 404);
    return establishment;
  }

  async updateEstablishment(establishmentId: number, updateData: Partial<Establishment>) {
    const establishment = await this.getEstablishmentProfile(establishmentId);
    this.establishmentRepository.merge(establishment, updateData);
    return await this.establishmentRepository.save(establishment);
  }

  async softDeleteEstablishment(establishmentId: number) {
    await this.establishmentRepository.update(establishmentId, { status: 'INATIVO' } as any);
    return { message: 'Establishment deactivated.' };
  }

  private async ensureDefaultConfiguration(establishmentId: number) {
    const configExists = await this.configRepository.findOne({ where: { id: establishmentId } });
    if (!configExists) {
      const defaultConfig = this.configRepository.create({
        id: establishmentId,
        establishment: { id: establishmentId },
        backgroundColor: '#F4F4F9',
        cardsColor: '#FFFFFF',
        buttonsColor: '#E85D5D',
        allowObservations: true,
        comandaLabel: 'Comanda',
      });
      await this.configRepository.save(defaultConfig);
    }
  }
}