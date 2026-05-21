import { NextFunction, Request, Response } from "express"
import { mercadoPagoService } from "../service"
import { SubscriptionStatus } from "../enum"
import { subscriptionRepository } from "../repository"

export async function subscriptionMiddleware(req: Request, res: Response, next: NextFunction) {
    const establishmentId = (req as any).usuario?.estabelecimento

    if (!establishmentId) {
        return res.status(403).json({ message: 'Acesso não permitido' })
    }

    try {
        const [subscription] = await subscriptionRepository.getSubscriptionByEstablishment(establishmentId)

        if (!subscription)
            return res.status(402).json({ message: 'Nenhuma assinatura encontrada' })

        // Expiration takes priority over all statuses
        if (subscription.expirationDate <= new Date()) {
            await subscriptionRepository.updateSubscriptionStatus(subscription.id, SubscriptionStatus.EXPIRADA)
            return res.status(402).json({ message: 'Assinatura expirada' })
        }

        if (subscription.status === SubscriptionStatus.EXPIRADA)
            return res.status(402).json({ message: 'Assinatura expirada' })

        // Cancelled but expiration date not yet reached — still has access
        if (subscription.status === SubscriptionStatus.CANCELADA)
            return next()

        // Already confirmed as paid — skip MP call
        if (subscription.status === SubscriptionStatus.PAGA)
            return next()

        // Pending: check MP to see if payment was approved
        const order = await mercadoPagoService.getOrder(subscription.mercadoPagoId)

        if (order.status_detail === 'accredited') {
            await subscriptionRepository.updateSubscriptionStatus(subscription.id, SubscriptionStatus.PAGA)
            return next()
        }

        if (order.status_detail === 'in_process')
            return next()

        if (order.status_detail === 'canceled')
            return res.status(402).json({ message: 'Assinatura cancelada' })

        return res.status(402).json({ message: 'Há problemas com o pagamento da sua assinatura' })

    } catch {
        return res.status(402).json({ message: 'Há problemas com o pagamento da sua assinatura' })
    }
}
