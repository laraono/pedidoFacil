import { NextFunction, Request, Response } from "express"
import { AppError } from "./error"
import { mercadoPagoService, subscriptionService } from "../service"
import { SubscriptionStatus } from "../enum"
import { subscriptionRepository } from "../repository"

export async function subscriptionMiddleware(req, res: Response, next: NextFunction) {
    const establishmentId = req.usuario?.estabelecimento

    if(!establishmentId) {
        return res.status(403).json({ message: 'Acesso não permitido' })
    }

    try {
        const [subscription] = await subscriptionRepository.getSubscriptionByEstablishment(establishmentId)

        if (!subscription)
            return res.status(402).json({message: 'Nenhuma assinatura encontrada'})

        if (subscription.status === SubscriptionStatus.CANCELADA)
            return res.status(402).json({message: 'Assinatura cancelada'})

        if (subscription.status === SubscriptionStatus.EXPIRADA)
            return res.status(402).json({message: 'Assinatura expirada'})

        if (subscription.expirationDate <= new Date()) {
            await subscriptionRepository.updateSubscriptionStatus(subscription.id, SubscriptionStatus.EXPIRADA)
            return res.status(402).json({message: 'Assinatura expirada'})
        }

        // Assinatura já ativa no DB — confia no status sem chamar o MercadoPago a cada request
        if (subscription.status === SubscriptionStatus.PAGA) {
            return next()
        }

        // Status pendente: consulta o MP para verificar se o pagamento foi aprovado
        const order = await mercadoPagoService.getOrder(subscription.mercadoPagoId)

        if (order.status_detail === 'accredited') {
            await subscriptionRepository.updateSubscriptionStatus(subscription.id, SubscriptionStatus.PAGA)
            return next()
        }

        if (order.status_detail === 'in_process') {
            return next()
        }

        if (order.status_detail === 'canceled') {
            return res.status(402).json({message: 'Assinatura cancelada'})
        }

        return res.status(402).json({message: 'Há problemas com o pagamento da sua assinatura'})

    } catch {
        res.status(402).json({message: 'Há problemas com o pagamento da sua assinatura'})
    }
}