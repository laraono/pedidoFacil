import { Establishment } from '../database/entity/Establishment';
import { AppError } from '../middleware/error/AppError';
import { EstablishmentRepository } from '../repository/EstablishmentRepository';
import { ConfigurationRepository } from '../repository/ConfigurationRepository';
import { MercadoPagoService } from './MercadoPagoService';
import { User } from '../database/entity/User';
import { ServiceType } from '../enum';

export class EstablishmentService {

  constructor(
    private establishmentRepository: EstablishmentRepository,
    private configRepository: ConfigurationRepository,
    private mercadoPagoService?: MercadoPagoService
  ) { }

  private parseServiceTypes(types: any): string[] {
    if (Array.isArray(types)) return types;
    if (typeof types !== 'string' || !types) return [];
    try {
      return JSON.parse(types);
    } catch {
      return [types];
    }
  }

  
  async checkCnpjAvailable(cnpj: string) {
    const exists = await this.establishmentRepository.findByCnpj(cnpj);
    if (exists) throw new AppError('Este CNPJ já está cadastrado.', 409);
    return { available: true };
  }

  async validateAccessCode(code: string): Promise<Establishment> {
    const establishment = await this.establishmentRepository.findByAccessCode(code.trim().toUpperCase());

    if (!establishment) {
      throw new AppError('Código de acesso inválido.', 404);
    }

    const serviceTypes = this.parseServiceTypes(establishment.serviceTypes);
    const hasAutoatendimento = serviceTypes.includes('Autoatendimento');

    if (!hasAutoatendimento) {
      throw new AppError('O autoatendimento está desativado para este estabelecimento.', 403);
    }

    return establishment;
  }

  async getEstablishmentProfile(establishmentId: number) {
    const establishment = await this.establishmentRepository.getByIdWithRelations(establishmentId);
    if (!establishment) throw new AppError('Establishment not found.', 404);
    return establishment;
  }

  private generateSelfServiceCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  async updateEstablishment(establishmentId: number, updateData: any) {
    const establishment = await this.getEstablishmentProfile(establishmentId);

    const paymentMethods = typeof updateData.paymentMethods !== 'string'
      ? JSON.stringify(updateData.paymentMethods)
      : updateData.paymentMethods;

    if (updateData.selfServiceEnabled !== undefined) {
      const currentTypes = this.parseServiceTypes(establishment.serviceTypes);
      if (updateData.selfServiceEnabled) {
        if (!currentTypes.includes(ServiceType.AUTOATENDIMENTO)) {
          currentTypes.push(ServiceType.AUTOATENDIMENTO);
        }
        if (!establishment.selfServiceCode) {
          updateData.selfServiceCode = this.generateSelfServiceCode();
        }
      } else {
        const idx = currentTypes.indexOf(ServiceType.AUTOATENDIMENTO);
        if (idx > -1) currentTypes.splice(idx, 1);
      }
      updateData.serviceTypes = currentTypes;
    }

    this.establishmentRepository.merge(establishment, {
      name: updateData.name,
      cnpj: updateData.cnpj,
      phone: updateData.phone,
      address: updateData.address,
      paymentMethods: paymentMethods,
      selfServiceCode: updateData.selfServiceCode ?? establishment.selfServiceCode,
      serviceTypes: updateData.serviceTypes !== undefined ? JSON.stringify(updateData.serviceTypes) : establishment.serviceTypes,
      pixStaticEnabled: updateData.pixStaticEnabled,
      ...(updateData.pixQrCodeUrl !== undefined && { pixQrCodeUrl: updateData.pixQrCodeUrl }),
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

  async listForAdmin() {
    const establishments = await this.establishmentRepository.findAllForAdmin();
    return establishments.map(e => {
      const latestSub = e.subscription ?? null;
      return {
        id: e.id,
        name: e.name,
        cnpj: e.cnpj,
        status: e.deletedAt ? 'Inativo' : 'Ativo',
        manager: e.manager ? { id: e.manager.id, name: e.manager.name, email: (e.manager as any).email } : null,
        plan: latestSub?.plan ? { name: latestSub.plan.name } : null,
        subscription: latestSub ? { status: latestSub.status } : null,
      };
    });
  }

  async getDetailForAdmin(id: number) {
    const establishment = await this.establishmentRepository.findByIdForAdmin(id);
    if (!establishment) throw new AppError('Estabelecimento não encontrado.', 404);

    const latestSub = establishment.subscription ?? null;

    return {
      id: establishment.id,
      name: establishment.name,
      cnpj: establishment.cnpj,
      phone: establishment.phone ?? null,
      address: establishment.address ?? null,
      selfServiceCode: establishment.selfServiceCode ?? null,
      manager: establishment.manager ?? null,
      subscription: latestSub ?? null,
    };
  }

  async createStore(params: { address: string; city: string; state: string; user: User }) {
    const establishment = await this.establishmentRepository.findByManagerId(params.user.id);
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

}