import { DataSource, Repository } from "typeorm";
import { Coupon } from "../database/entity/Coupon";
import { CreateCouponDTO } from "../dto/coupon/CreateCouponDTO";

export class CouponRepository {
    
    private repo: Repository<Coupon>;

    constructor(dataSource: DataSource) {
        this.repo = dataSource.getRepository(Coupon);
    }

    async createCoupon(establishmentId: number, data: CreateCouponDTO): Promise<Coupon> {
        const { establishmentId: _, ...cleanData } = data;

        const couponData = {
            ...cleanData,
            establishment: { id: establishmentId }
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
        await this.repo.update(couponId, updateData);
    }

    async softDeleteCoupon(couponId: number): Promise<void> {
        await this.repo.softDelete(couponId);
    }

}