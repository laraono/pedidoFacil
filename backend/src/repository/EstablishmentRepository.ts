import { DataSource, Repository } from "typeorm";
import { Establishment } from "../database/entity/Establishment";

export class EstablishmentRepository extends Repository<Establishment> {

    constructor(dataSource: DataSource) {
        super(Establishment, dataSource.createEntityManager());
    }

    async findByManagerId(userId: number): Promise<Establishment | null> {
        return await this.findOne({ where: { manager: { id: userId } } });
    }

    async findByCnpj(cnpj: string): Promise<Establishment | null> {
        return await this.findOne({ where: { cnpj } });
    }

    async findByAccessCode(code: string): Promise<Establishment | null> {
        return await this.findOne({ 
            where: { selfServiceCode: code },
            relations: ['configurations'] 
        });
    }

    async getByIdWithRelations(id: number): Promise<Establishment | null> {
        return await this.findOne({
            where: { id },
            relations: ['manager', 'configurations', 'paymentMethods']
        });
    }

    async getEstablishment(establishmetnId: number) {
        return await this.findOne({
            where: {
                id: establishmetnId
            }
        })
    }

    async addMercadoPagoId(establishmentId: number, mercadoPagoId: string) {
        await this.update(establishmentId, {mercadoPagoId})
    }

    async findAllForAdmin(): Promise<Establishment[]> {
        return await this.find({
            withDeleted: true,
            relations: ['manager', 'subscription', 'subscription.plan'],
            order: { id: 'ASC' }
        });
    }

    async findByIdForAdmin(id: number): Promise<Establishment | null> {
        return await this.findOne({
            where: { id },
            withDeleted: true,
            relations: ['manager', 'manager.perfilGerente', 'subscription', 'subscription.plan']
        });
    }

}