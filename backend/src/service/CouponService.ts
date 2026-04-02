import { CreateCouponDTO } from "../dto/coupon/CreateCouponDTO";
import { AppError } from "../middleware/error/AppError";
import { CouponRepository } from "../repository/CouponRepository";

export class CouponService {

    private couponRepository: CouponRepository;

    constructor(couponRepository: CouponRepository) {
        this.couponRepository = couponRepository;
    }

    async createCoupon(establishmentId: number, data: CreateCouponDTO) {
        const existingCoupon = await this.couponRepository.getCouponByCode(data.code, establishmentId);

        if (existingCoupon) {
            throw new AppError('Já existe um cupom com este código para o seu estabelecimento.', 409);
        }

        if (data.expirationDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const expDate = new Date(`${data.expirationDate}T12:00:00`);
            if (expDate < today) {
                throw new AppError('A data de validade não pode ser anterior a hoje.', 400);
            }
        }

        const coupon = await this.couponRepository.createCoupon(establishmentId, data);
        return coupon.id;
    }

    async listCoupons(establishmentId: number) {
        return await this.couponRepository.listCouponsByEstablishment(establishmentId);
    }

    async updateCoupon(couponId: number, establishmentId: number, data: Partial<CreateCouponDTO>) {
        const coupon = await this.couponRepository.getCouponById(couponId, establishmentId);
        
        if (!coupon) {
            throw new AppError('Cupom não encontrado.', 404);
        }

        if (data.code && data.code !== coupon.code) {
            const existingCoupon = await this.couponRepository.getCouponByCode(data.code, establishmentId);
            if (existingCoupon) {
                throw new AppError('Já existe um cupom com este código para o seu estabelecimento.', 409);
            }
        }

        const { establishmentId: _, ...updateData } = data;

        if (updateData.expirationDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const expDate = new Date(`${updateData.expirationDate}T12:00:00`);
            if (expDate < today) {
                throw new AppError('A data de validade não pode ser anterior a hoje.', 400);
            }
        }

        await this.couponRepository.updateCoupon(couponId, establishmentId, updateData);
    }

    async deleteCoupon(couponId: number, establishmentId: number) {
        const coupon = await this.couponRepository.getCouponById(couponId, establishmentId);

        if (!coupon) {
            throw new AppError('Cupom não encontrado.', 404);
        }

        await this.couponRepository.softDeleteCoupon(couponId);
    }

    async validateAndApplyCoupon(code: string, establishmentId: number) {
        const coupon = await this.couponRepository.getCouponByCode(code, establishmentId);

        if (!coupon) {
            throw new AppError('Cupom inválido ou inexistente.', 404);
        }

        if (coupon.quantity !== null && coupon.quantity <= 0) {
            throw new AppError('Este cupom já atingiu o limite de usos.', 400);
        }

        if (coupon.expirationDate) {
            const today = new Date();
            const expiration = new Date(`${coupon.expirationDate}T12:00:00`);
            today.setHours(0, 0, 0, 0);

            if (today > expiration) {
                throw new AppError('Este cupom está expirado.', 400);
            }
        }

        return coupon;
    }
}