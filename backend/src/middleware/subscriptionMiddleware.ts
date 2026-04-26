import { NextFunction, Request, Response } from "express"
import { AppError } from "./error"
import { subscriptionService } from "../service"

export async function subscriptionMiddleware(req, res: Response, next: NextFunction) {
    const establishmentId = req.usuario?.estabelecimento

    if(!establishmentId) {
        throw new AppError('Não autorizado', 401)
    }

    try {
        const status = await subscriptionService.verifySubscription(establishmentId)
        
        if(status === 'authorized')
            next()
        else if (status === 'canceled')
            return res.status(402).send('Assinatura cancelada')
        else
            return res.status(402).send('Há problemas com o pagamento da sua assinatura')
    } catch {
        return res.status(402).send('Há problemas com o pagamento da sua assinatura')
    }
}