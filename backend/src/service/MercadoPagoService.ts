import { MercadoPagoConfig, Preference } from 'mercadopago';
import { CreatePlanMercadoPago } from '../dto';
import { AppError } from '../middleware';
import axios from 'axios'

export class MercadoPagoService {

    async createPlan(params: CreatePlanMercadoPago) {

        if(!process.env.MERCADOPAGO_ACCESS_TOKEN) {
            return
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.MERCADOPAGO_ACCESS_TOKEN 
        }

        try {
            const answer = await axios({
                method: "post",
                url: "https://api.mercadopago.com/preapproval_plan",
                data: params,
                headers
            })
            return answer.data
        } catch(error) {
            throw new AppError('Erro criando plano', 500)
        }
    }

    async createSubscription() {
        next_payment_date
        card_token_id
        back_url
        payer_email
    }
}


