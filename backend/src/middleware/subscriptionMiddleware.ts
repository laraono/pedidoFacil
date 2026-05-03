import { NextFunction, Request, Response } from "express"
import { AppError } from "./error"
import { mercadoPagoService, subscriptionService } from "../service"
import { SubscriptionStatus } from "../enum"
import { subscriptionRepository } from "../repository"

export async function subscriptionMiddleware(req, res: Response, next: NextFunction) {
    const establishmentId = req.usuario?.estabelecimento

    if(!establishmentId) {
        throw new AppError('Não autorizado', 401)
    }

    try {
        const [subscription] = await subscriptionRepository.getSubscriptionByEstablishment(establishmentId)

        if (subscription.status === SubscriptionStatus.CANCELADA) res.status(402).json({message: 'Assinatura cancelada'})
        if (subscription.status === SubscriptionStatus.EXPIRADA) res.status(402).json({message: 'Assinatura expirada'})

        if (subscription.expirationDate <= new Date()) {
            await subscriptionRepository.updateSubscriptionStatus(subscription.id, SubscriptionStatus.EXPIRADA)

            res.status(402).json({message: 'Assinatura expirada'})
        } 

        const order =  await mercadoPagoService.getOrder(subscription.mercadoPagoId)
        console.log('ORDER  TRANSACTIONS', order.transactions.payments)
        
        if(order.status_detail === 'in_process' || order.status_detail === 'accredited')
            next()
        else if (order.status_detail === 'canceled')
            res.status(402).json({message: 'Assinatura cancelada'})
        else
            res.status(402).json({message: 'Há problemas com o pagamento da sua assinatura'})

    } catch {
        res.status(402).json({message: 'Há problemas com o pagamento da sua assinatura'})
    }
}