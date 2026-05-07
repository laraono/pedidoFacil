import { Establishment } from '../database/entity/Establishment';
import { AppError } from '../middleware/error/AppError';
import { ServiceType } from '../enum';
import { gerarTokens } from '../config/crypto';
import { EstablishmentRepository } from '../repository/EstablishmentRepository';
import { ConfigurationRepository } from '../repository/ConfigurationRepository';
import { UserRepository } from '../repository/UserRepository';
import { RoleRepository } from '../repository/RoleRepository';
import { SaveOnboardingStepDTO } from '../dto/establishment/SaveOnboardingStepDTO';
import { FinalizeOnboardingDTO } from '../dto/establishment/FinalizeOnboardingDTO';
import { MercadoPagoService } from './MercadoPagoService';
import { User } from '../database/entity/User';

export class EstablishmentService {

  constructor(
    private establishmentRepository: EstablishmentRepository,
    private userRepository: UserRepository,
    private configRepository: ConfigurationRepository,
    private roleRepository: RoleRepository,
    private mercadoPagoService?: MercadoPagoService
  ) { }

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

  private parseServiceTypes(types: any): string[] {
    if (Array.isArray(types)) return types;
    if (typeof types !== 'string' || !types) return [];
    try {
      return JSON.parse(types);
    } catch {
      return [types];
    }
  }

  
  async validateAccessCode(code: string): Promise<Establishment> {
    const establishment = await this.establishmentRepository.findByAccessCode(code);

    if (!establishment) {
      throw new AppError('Código de acesso inválido.', 404);
    }

    if (!establishment.selfServiceEnabled) {
      throw new AppError('O autoatendimento está desativado para este estabelecimento.', 403);
    }

    return establishment;
  }

  async saveOnboardingStep(userId: number, stepData: SaveOnboardingStepDTO) {
    const user = await this.userRepository.findByIdWithEstablishment(userId);
    if (!user) throw new AppError('User not found.', 404);

    let establishment = await this.establishmentRepository.findByManagerId(userId);

    if (!establishment) {
      if (stepData.cnpj) {
        const cnpjExists = await this.establishmentRepository.findByCnpj(stepData.cnpj);
        if (cnpjExists) throw new AppError('This CNPJ is already registered.', 400);
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
      await this.userRepository.updateEstablishmentId(userId, saved.id);
    }

    await this.ensureDefaultConfiguration(saved.id);
    return saved;
  }

  async finalizeOnboarding(userId: number, data: FinalizeOnboardingDTO) {
    const { roles: rolesToCreate, hasTotem } = data;
    const user = await this.userRepository.findByIdWithEstablishment(userId);

    if (!user || !user.establishment) {
      throw new AppError('No establishment linked to this user.', 400);
    }

    const establishmentId = user.establishment.id;
    const establishment = await this.getEstablishmentProfile(establishmentId);

    const managerRole = this.roleRepository.create({
      name: 'Gerente',
      permissions: JSON.stringify(['ALL']),
      establishment: { id: establishmentId } as any,
    });
    const savedManagerRole = await this.roleRepository.save(managerRole);

    await this.userRepository.updateRoleId(userId, savedManagerRole.id);

    if (rolesToCreate && rolesToCreate.length > 0) {
      const roles = rolesToCreate.map((r) => this.roleRepository.create({
        name: r.label,
        permissions: JSON.stringify(r.permissions),
        establishment: { id: establishmentId } as any,
      }));
      await this.roleRepository.saveMany(roles);
    }

    if (hasTotem) {
      const currentTypes = this.parseServiceTypes(establishment.serviceTypes);

      if (!currentTypes.includes(ServiceType.AUTOATENDIMENTO)) {
        currentTypes.push(ServiceType.AUTOATENDIMENTO);
        establishment.serviceTypes = JSON.stringify(currentTypes);
        await this.establishmentRepository.save(establishment);
      }
    }

    const updatedUser = await this.userRepository.findByIdWithRelations(userId);
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
    const establishment = await this.establishmentRepository.getByIdWithRelations(establishmentId);
    if (!establishment) throw new AppError('Establishment not found.', 404);
    return establishment;
  }

  async updateEstablishment(establishmentId: number, updateData: any) {
    const establishment = await this.getEstablishmentProfile(establishmentId);

    const paymentMethods = typeof updateData.paymentMethods !== 'string'
      ? JSON.stringify(updateData.paymentMethods)
      : updateData.paymentMethods;

    this.establishmentRepository.merge(establishment, {
      name: updateData.name,
      cnpj: updateData.cnpj,
      phone: updateData.phone,
      address: updateData.address,
      paymentMethods: paymentMethods,
      selfServiceEnabled: updateData.selfServiceEnabled,
      selfServiceCode: updateData.selfServiceCode,
    });

    await this.establishmentRepository.save(establishment);

    if (updateData.configurations) {
      const config = await this.configRepository.findByEstablishmentId(establishmentId);
      if (config) {
        this.configRepository.merge(config, {
          logo: updateData.configurations.logo !== undefined ? updateData.configurations.logo : config.logo,
          backgroundColor: updateData.configurations.backgroundColor ?? config.backgroundColor,
          cardsColor: updateData.configurations.cardsColor ?? config.cardsColor,
          buttonsColor: updateData.configurations.buttonsColor ?? config.buttonsColor,
          comandaLabel: updateData.configurations.comandaLabel ?? config.comandaLabel,
          textsColor: updateData.configurations.textsColor ?? config.textsColor,
          buttonsTextColor: updateData.configurations.buttonsTextColor ?? config.buttonsTextColor,
          activeCateogryColor: updateData.configurations.activeCateogryColor ?? config.activeCateogryColor,
          fontFamily: updateData.configurations.fontFamily ?? config.fontFamily,
          allowObservations: updateData.configurations.allowObservations ?? config.allowObservations
        });
        await this.configRepository.save(config);
      }
    }

    return await this.getEstablishmentProfile(establishmentId);
  }

  async softDeleteEstablishment(establishmentId: number) {
    const establishment = await this.getEstablishmentProfile(establishmentId);
    await this.establishmentRepository.softRemove(establishment);
    return { message: 'Establishment desativado com sucesso (Soft Delete).' };
  }

  async createStore(params: { address: string; city: string; state: string; user: User }) {
    const establishment = await this.establishmentRepository.getEstablishmentByUser(params.user);
    if (!establishment || !this.mercadoPagoService) return;

    const storeId = await this.mercadoPagoService.createStore({
      name: establishment.name,
      establishmentId: establishment.id,
      address: params.address,
      city: params.city,
      state: params.state,
    });

    if (storeId) {
      await this.establishmentRepository.addMercadoPagoId(establishment.id, storeId);
    }
  }

  private async ensureDefaultConfiguration(establishmentId: number) {
    const configExists = await this.configRepository.findByEstablishmentId(establishmentId);
    if (!configExists) {
      const defaultConfig = this.configRepository.create({
        establishment: { id: establishmentId } as any,
        backgroundColor: '#F4F4F9',
        cardsColor: '#FFFFFF',
        buttonsColor: '#E85D5D',
        comandaLabel: 'Comanda',
        activeCateogryColor: '#E85D5D',
        textsColor: '#333333',
        buttonsTextColor: '#FFFFFF',
        fontFamily: 'Inter',
        allowObservations: true
      });
      await this.configRepository.save(defaultConfig);
    }
  }
}