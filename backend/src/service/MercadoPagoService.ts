import { MercadoPagoConfig, Preference } from 'mercadopago';


export class MercadoPagoService {
    async createPlan() {
        if(!process.env.MERCADOPAGO_ACCESS_TOKEN) {
            return
        }
        const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });

    }
}


