import { AppDataSource } from '../database/data-source'
import { Coupon } from '../database/entity/Coupon'
import { AppError } from '../middleware/error/AppError'
import { ComandaStatus } from '../enum' // Certifique-se do caminho correto

export class CouponService {
    private couponRepository = AppDataSource.getRepository(Coupon)

    async createCoupon(establishmentId: number, data: Partial<Coupon>) {
        const existingCoupon = await this.couponRepository.findOne({
            where: { code: data.code?.toUpperCase(), establishment: { id: establishmentId } }
        })

        if (existingCoupon) {
            throw new AppError('Já existe um cupom com este código neste estabelecimento', 400)
        }

        const coupon = this.couponRepository.create({
            ...data,
            code: data.code?.toUpperCase(),
            establishment: { id: establishmentId }
        })

        return await this.couponRepository.save(coupon)
    }

    async getCouponsByEstablishment(establishmentId: number) {
        return await this.couponRepository.find({
            where: { establishment: { id: establishmentId } }
        })
    }

    // Validação adaptada para a sua Entidade
    async validateCoupon(code: string, establishmentId: number) {
        const coupon = await this.couponRepository.findOne({
            where: { code: code.toUpperCase(), establishment: { id: establishmentId } }
        })

        if (!coupon) throw new AppError('Cupom inválido ou não encontrado', 404)
        
        // Adapte "ATIVO" para o status correto que você usa no seu enum
        if (coupon.status !== ComandaStatus.ABERTA) {
            throw new AppError('Este cupom não está ativo', 400)
        }
        
        if (coupon.expirationDate && new Date() > new Date(coupon.expirationDate)) {
            throw new AppError('Este cupom já expirou', 400)
        }

        // Valida se ainda tem quantidade disponível (caso seja um cupom limitado)
        if (coupon.quantity !== null && coupon.quantity !== undefined && coupon.quantity <= 0) {
            throw new AppError('Este cupom esgotou', 400)
        }

        return coupon
    }

    // Método para abater o uso após pagamento (agora decrementa a quantidade)
    async decrementCouponQuantity(couponId: number) {
        const coupon = await this.couponRepository.findOne({ where: { id: couponId } })
        if (coupon && coupon.quantity !== null && coupon.quantity > 0) {
            coupon.quantity -= 1
            await this.couponRepository.save(coupon)
        }
    }

    async softDeleteCoupon(couponId: number, establishmentId: number) {
        const coupon = await this.couponRepository.findOne({
            where: { id: couponId, establishment: { id: establishmentId } }
        })

        if (!coupon) throw new AppError('Cupom não encontrado', 404)

        await this.couponRepository.softRemove(coupon)
        return { message: 'Cupom excluído com sucesso' }
    }
}