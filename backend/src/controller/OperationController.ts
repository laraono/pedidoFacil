import { Request, Response, NextFunction } from 'express'
import { CouponService } from '../service/CouponService'
import { ConfigurationService } from '../service/ConfigurationService'

const couponService = new CouponService()
const configurationService = new ConfigurationService()

export class OperationController {
    
    // --- CUPONS ---
    async createCoupon(req: Request, res: Response, next: NextFunction) {
        try {
            const establishmentId = (req as any).usuario.estabelecimento
            const coupon = await couponService.createCoupon(establishmentId, req.body)
            return res.status(201).json(coupon)
        } catch (error) { next(error) }
    }

    async listCoupons(req: Request, res: Response, next: NextFunction) {
        try {
            const establishmentId = (req as any).usuario.estabelecimento
            const coupons = await couponService.getCouponsByEstablishment(establishmentId)
            return res.status(200).json(coupons)
        } catch (error) { next(error) }
    }

    // Rota pública para o Totem validar (pode passar o ID do estabelecimento no body ou params)
    async validateCouponForTotem(req: Request, res: Response, next: NextFunction) {
        try {
            const { code, establishmentId } = req.body
            const validCoupon = await couponService.validateCoupon(code, establishmentId)
            return res.status(200).json(validCoupon)
        } catch (error) { next(error) }
    }

    async deleteCoupon(req: Request, res: Response, next: NextFunction) {
        try {
            const establishmentId = (req as any).usuario.estabelecimento
            const couponId = Number(req.params.id)
            const result = await couponService.softDeleteCoupon(couponId, establishmentId)
            return res.status(200).json(result)
        } catch (error) { next(error) }
    }

    // --- CONFIGURAÇÕES DO TOTEM ---
    async getMenuConfig(req: Request, res: Response, next: NextFunction) {
        try {
            // Pode ser acessado tanto pelo gerente logado quanto pelo totem via ID
            const establishmentId = (req as any).usuario?.estabelecimento || req.params.establishmentId
            const config = await configurationService.getOrCreateConfiguration(establishmentId)
            return res.status(200).json(config)
        } catch (error) { next(error) }
    }

    async updateMenuConfig(req: Request, res: Response, next: NextFunction) {
        try {
            const establishmentId = (req as any).usuario.estabelecimento
            const updatedConfig = await configurationService.updateConfiguration(establishmentId, req.body)
            return res.status(200).json(updatedConfig)
        } catch (error) { next(error) }
    }
}