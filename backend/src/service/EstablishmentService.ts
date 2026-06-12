import { In } from 'typeorm';
import { Establishment } from '../database/entity/Establishment';
import { PaymentMethod } from '../database/entity/PaymentMethod';
import { AppError } from '../middleware/error/AppError';
import { EstablishmentRepository } from '../repository/EstablishmentRepository';
import { ConfigurationRepository } from '../repository/ConfigurationRepository';
import { MercadoPagoService } from './MercadoPagoService';
import { User } from '../database/entity/User';

export class EstablishmentService {

  constructor(
    private establishmentRepository: EstablishmentRepository,
    private configRepository: ConfigurationRepository,
    private mercadoPagoService?: MercadoPagoService
  ) { }

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

    if (!establishment.temAutoatendimento) {
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

    if (updateData.selfServiceEnabled !== undefined) {
      updateData.temAutoatendimento = !!updateData.selfServiceEnabled;
      if (updateData.selfServiceEnabled && !establishment.selfServiceCode) {
        updateData.selfServiceCode = this.generateSelfServiceCode();
      }
    }

    if (updateData.paymentMethods !== undefined && Array.isArray(updateData.paymentMethods)) {
      const pmRepo = this.establishmentRepository.manager.getRepository(PaymentMethod);
      establishment.paymentMethods = await pmRepo.findBy({ name: In(updateData.paymentMethods) });
    }

    this.establishmentRepository.merge(establishment, {
      name: updateData.name,
      cnpj: updateData.cnpj,
      phone: updateData.phone,
      address: updateData.address,
      selfServiceCode: updateData.selfServiceCode ?? establishment.selfServiceCode,
      temAutoatendimento: updateData.temAutoatendimento ?? establishment.temAutoatendimento,
    });

    await this.establishmentRepository.save(establishment);

    if (updateData.configurations) {
      const config = await this.configRepository.findByEstablishmentId(establishmentId);
      if (config) {
        const cfgUpdates = Object.fromEntries(
          Object.entries(updateData.configurations).filter(([, v]) => v !== undefined)
        );
        this.configRepository.merge(config, cfgUpdates);
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
      manager: establishment.manager ? {
        id: establishment.manager.id,
        name: establishment.manager.name,
        email: establishment.manager.email,
        phone: establishment.manager.phone ?? null,
        cpf: establishment.manager.perfilGerente?.cpf ?? null,
        address: establishment.manager.perfilGerente?.address ?? null,
        city: establishment.manager.perfilGerente?.city ?? null,
        state: establishment.manager.perfilGerente?.state ?? null,
      } : null,
      subscription: latestSub ?? null,
      selfServiceEnabled: establishment.temAutoatendimento,
    };
  }

  /*
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
  */

}