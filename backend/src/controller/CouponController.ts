import { Request, Response } from 'express';
import { CouponService } from "../service/CouponService";
import { auditLog } from '../utils/logger';

export class CouponController {

    private couponService: CouponService;

    constructor(couponService: CouponService) {
        this.couponService = couponService;
    }

    async create(req: Request, res: Response) {
        const usuario = (req as any).usuario;
        const establishmentId = usuario?.estabelecimento || req.body.establishmentId; 
        
        const data = req.body;

        if (!establishmentId) {
            return res.status(400).send({ error: "ID do estabelecimento é obrigatório." });
        }

        const couponId = await this.couponService.createCoupon(Number(establishmentId), data);

        auditLog('create_coupon.success', {
            establishmentId,
            ip: req.ip,
            timestamp: new Date().toISOString(),
        });

        res.status(201).send({ id: couponId });
    }

    async list(req: Request, res: Response) {
        const usuario = (req as any).usuario;
        const establishmentId = usuario?.estabelecimento; 
        
        if (!establishmentId) {
            return res.status(400).send({ error: "ID do estabelecimento não encontrado no token." });
        }

        const coupons = await this.couponService.listCoupons(Number(establishmentId));

        res.status(200).send(coupons);
    }

    async update(req: Request, res: Response) {
        const usuario = (req as any).usuario;
        const establishmentId = usuario?.estabelecimento; 
        const couponId = Number(req.params.id);
        const data = req.body;

        if (!establishmentId) {
            return res.status(400).send({ error: "ID do estabelecimento obrigatório." });
        }

        await this.couponService.updateCoupon(couponId, Number(establishmentId), data);

        auditLog('update_coupon.success', {
            establishmentId,
            couponId,
            ip: req.ip,
            timestamp: new Date().toISOString(),
        });

        res.sendStatus(204);
    }

    async validate(req: Request, res: Response) {
        const usuario = (req as any).usuario;
        const establishmentId = usuario?.estabelecimento || Number(req.query.establishmentId); 
        const code = req.params.code as string;

        if (!establishmentId) {
            return res.status(400).send({ error: "ID do estabelecimento é obrigatório para validar o cupom." });
        }

        const coupon = await this.couponService.validateAndApplyCoupon(code, Number(establishmentId));
        
        auditLog('validate_coupon.success', {
            establishmentId,
            couponId: coupon.id,
            ip: req.ip,
            timestamp: new Date().toISOString(),
        });
        
        res.status(200).send(coupon);
    }

    async delete(req: Request, res: Response) {
        const usuario = (req as any).usuario;
        const establishmentId = usuario?.estabelecimento; 
        const couponId = Number(req.params.id);

        if (!establishmentId) {
            return res.status(400).send({ error: "ID do estabelecimento não encontrado." });
        }

        await this.couponService.deleteCoupon(couponId, Number(establishmentId));

        auditLog('delete_coupon.success', {
            establishmentId,
            couponId,
            ip: req.ip,
            timestamp: new Date().toISOString(),
        });

        res.sendStatus(204);
    }
}