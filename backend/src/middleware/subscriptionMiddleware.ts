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

        if (subscription.expirationDate <= new Date()) {
            await subscriptionRepository.updateSubscriptionStatus(subscription.id, SubscriptionStatus.EXPIRADA)
            return res.status(402).json({ message: 'Assinatura expirada' })
        }

        if (subscription.status.nome === SubscriptionStatus.EXPIRADA)
            return res.status(402).json({ message: 'Assinatura expirada' })

        if (subscription.status.nome === SubscriptionStatus.CANCELADA)
            return next()

        if (subscription.status.nome === SubscriptionStatus.PAGA)
            return next()

        if (!subscription.mercadoPagoId)
            return res.status(402).json({ message: 'Assinatura sem vínculo de pagamento' })

        const mp = await mercadoPagoService.getSubscription(subscription.mercadoPagoId) // fallback pro webhook

        if (mp.status === 'authorized') {
            await subscriptionRepository.updateSubscriptionStatus(subscription.id, SubscriptionStatus.PAGA)
            return next()
        }

        if (mp.status === 'paused')
            return next()

        if (mp.status === 'cancelled')
            return res.status(402).json({ message: 'Assinatura cancelada' })

        return res.status(402).json({ message: 'Há problemas com o pagamento da sua assinatura' })

    } catch {
        return res.status(402).json({ message: 'Há problemas com o pagamento da sua assinatura' })
    }
}
