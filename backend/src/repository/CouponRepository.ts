import { DataSource, Repository } from "typeorm";
import { Coupon } from "../database/entity/Coupon";
import { TipoDesconto } from "../database/entity/TipoDesconto";
import { CreateCouponDTO } from "../dto/coupon/CreateCouponDTO";
import { AppError } from "../middleware/error/AppError";

export class CouponRepository {

    private repo: Repository<Coupon>;
    private tipoDescontoRepo: Repository<TipoDesconto>;

    constructor(dataSource: DataSource) {
        this.repo = dataSource.getRepository(Coupon);
        this.tipoDescontoRepo = dataSource.getRepository(TipoDesconto);
    }

    async createCoupon(establishmentId: number, data: CreateCouponDTO): Promise<Coupon> {
        const { establishmentId: _, type, ...cleanData } = data;

        const tipoDesconto = await this.tipoDescontoRepo.findOne({ where: { nome: type } });
        if (!tipoDesconto) throw new AppError('Tipo de desconto inválido.', 400);

        const couponData = {
            ...cleanData,
            type: tipoDesconto,
            tipoDescontoNome: tipoDesconto.nome,
            establishment: { id: establishmentId },
        };

        const coupon = this.repo.create(couponData as any) as unknown as Coupon;

        return await this.repo.save(coupon);
    }

    async listCouponsByEstablishment(establishmentId: number): Promise<Coupon[]> {
        return await this.repo.find({
            where: { establishment: { id: establishmentId } }
        });
    }

    async getCouponById(couponId: number, establishmentId: number): Promise<Coupon | null> {
        return await this.repo.findOne({
            where: { id: couponId, establishment: { id: establishmentId } }
        });
    }

    async getCouponByCode(code: string, establishmentId: number): Promise<Coupon | null> {
        return await this.repo.findOne({
            where: { code, establishment: { id: establishmentId } }
        });
    }

    async updateCoupon(couponId: number, establishmentId: number, updateData: any): Promise<void> {
        const { type, ...rest } = updateData;

        const patch: any = { ...rest };

        if (type) {
            const tipoDesconto = await this.tipoDescontoRepo.findOne({ where: { nome: type } });
            if (!tipoDesconto) throw new AppError('Tipo de desconto inválido.', 400);
            patch.type = tipoDesconto;
            patch.tipoDescontoNome = tipoDesconto.nome;
        }

        await this.repo.update(couponId, patch);
    }

    async softDeleteCoupon(couponId: number): Promise<void> {
        await this.repo.softDelete(couponId);
    }

}