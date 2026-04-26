import { CreateOrderPaymentMP, CreateOrderSubscriptionMP, CreatePlanMercadoPago, CreateRegisterParamsMP, CreateStoreParamsMP, UpdateSubscriptionMP } from '../dto';
import { AppError } from '../middleware';
import axios from 'axios'
import opencage from 'opencage-api-client';
import crypto from 'crypto';
import { MercadoPagoConfig, OAuth } from 'mercadopago'

const v4 = require('uuid')

type CreateOrderType = {
    id: string,
    type: 'online',
    processing_mode: string,
    external_reference: string,
    total_amount: string,
    total_paid_amount: string,
    integration_data: {
        application_id: string
    },
    created_date: string,
    last_updated_date: string,
    country_code: 'BR',
    status: string,
    status_detail: string,
    capture_mode: string,
    transactions: {
        payments: Array< {
            id: string,
            amount: string
            paid_amount: string,
            reference_id: string,
            status: string,
            status_detail: string,
            payment_method: {
                id: 'visa',
                type: 'credit_card',
                token: string,
                installments: string,
                transaction_security: {
                    validation: string,
                    liability_shift: string,
                    url: string,
                    id: string,
                    type: string,
                    status: string
                }
            }
        }>
    }
}

export class MercadoPagoService {

    async createPlan(params: CreatePlanMercadoPago) {
        if(!process.env.MERCADOPAGO_ACCESS_TOKEN) {
            throw new AppError('', 500)
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
            console.log(error)
            throw new AppError('Erro criando plano', 500)
        }
    }

    async createSubscription(
        params: {
            payer_email: string,
            card_token_id: string,
            back_url: string
        }
    ) {
        if(!process.env.MERCADOPAGO_ACCESS_TOKEN) {
            throw new AppError('', 500)
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.MERCADOPAGO_ACCESS_TOKEN 
        }

        try {
            const answer = await axios({
                method: "post",
                url: "https://api.mercadopago.com/preapproval",
                data: params,
                headers
            })

            return answer.data
        } catch(error) {
            throw new AppError('Erro criando plano', 500)
        }
    }

    async getSubscription(mercadoPagoId: string) {
        if(!process.env.MERCADOPAGO_ACCESS_TOKEN) {
            throw new AppError('', 500)
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.MERCADOPAGO_ACCESS_TOKEN 
        }

        try {
            const answer = await axios({
                method: "get",
                url: `https://api.mercadopago.com/preapproval/${mercadoPagoId}/`,
                headers
            })

            return answer.data.status
        } catch(error) {
            throw new AppError('Erro criando plano', 500)
        }
    }

    async updateSubscriptionValue(params: UpdateSubscriptionMP) {
        if(!process.env.MERCADOPAGO_ACCESS_TOKEN) {
            throw new AppError('', 500)
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.MERCADOPAGO_ACCESS_TOKEN 
        }

        const updateSubscription = {
            auto_recurring: {
                transaction_amount: params.amount
            }
        }

        try {
            const answer = await axios({
                method: "put",
                url: `https://api.mercadopago.com/preapproval/${params.subscriptionId}`, 
                data: updateSubscription,
                headers
            })

            return answer.data.id

        } catch(error) {
            throw new AppError('', 500)
        }
    }

    async cancelSubscription(subscriptionId: string) {
        if(!process.env.MERCADOPAGO_ACCESS_TOKEN) {
            throw new AppError('', 500)
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.MERCADOPAGO_ACCESS_TOKEN 
        }

        const status = {status: 'canceled'}

        try {
            const answer = await axios({
                method: "put",
                url: `https://api.mercadopago.com/preapproval/${subscriptionId}`, 
                data: status,
                headers
            })

            return answer.data.id

        } catch(error) {
            throw new AppError('', 500)
        }
    }

    async createStore(params: CreateStoreParamsMP) {
        if(!process.env.MERCADOPAGO_ACCESS_TOKEN || !process.env.MERCADOPAGO_USER_ID) {
            throw new AppError('', 500)
        }

        const coordinates = await this.fetchCoordinates(params)

        if(!coordinates) {
            throw new AppError('', 500)
        }

        const address = params.address.split(',')

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.MERCADOPAGO_ACCESS_TOKEN 
        }

        const store = {
            name: params.name,
            user_id: process.env.MERCADOPAGO_USER_ID,
            external_id: params.establishmentId,
            location: {
                latitude: coordinates.lat,
                longitude: coordinates.lng,
                city_name: params.city,
                state_name: params.state,
                street_name: address[0],
                street_number: address[1]
            }
        }

        try {
            const answer = await axios({
                method: "post",
                url: `https://api.mercadopago.com/users/${process.env.MERCADOPAGO_USER_ID}/stores`, 
                data: store,
                headers
            })

            return answer.data.id

        } catch(error) {
            throw new AppError('', 500)
        }
    }

    async createRegister(params: CreateRegisterParamsMP) {
        if(!process.env.MERCADOPAGO_ACCESS_TOKEN) {
            throw new AppError('', 500)
        }

        const register = {
            name: params.name,
            store_id: params.mercadoPagoId,
            category: 5611203
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.MERCADOPAGO_ACCESS_TOKEN 
        }

        try {
            const answer = await axios({
                method: "post",
                url: "https://api.mercadopago.com/pos", // TODO ver lógica do caixa usar o nome para escolher maquininha e enviar dados do pagamento
                data: register,
                headers
            })

            return answer.data.id

        } catch(error) {
            throw new AppError('', 500)
        }
    }

    async getTerminals({ store, pos }: { store?: string; pos?: string }) {
        if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
            throw new AppError('Missing API Credentials', 500);
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
        };

        try {
            const response = await axios({
                method: "get",
                url: `https://api.mercadopago.com/terminals/v1/list`,
                headers,
                params: {
                    limit: 50,
                    offset: 0,
                    store_id: store,
                    pos_id: pos
                }
            });

            return response.data.terminals;
        } catch (error) {
            throw new AppError('Erro ao buscar terminais', 500);
        }
    }

    async createOrder(params: CreateOrderPaymentMP): Promise<CreateOrderType> {
        if(!process.env.MERCADOPAGO_ACCESS_TOKEN) {
            throw new AppError('', 500)
        }

        const order = {
            type: 'point',
            external_reference: params.orderId,
            transaction: {
                payments: {
                    amount: params.amount
                }
            },
            config: {
                point: {
                    terminal_id: params.terminal
                }
            }
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.MERCADOPAGO_ACCESS_TOKEN ,
            'X-Idempotency-Key': v4()
        }

        try {
            const answer = await axios({
                method: "post",
                url: "https://api.mercadopago.com/v1/orders", 
                headers,
                data: order
            })

            return answer.data

        } catch(error) {
            throw new AppError('', 500)
        }
    }

    async cancelOrder(orderId: string) {
        if(!process.env.MERCADOPAGO_ACCESS_TOKEN) {
            throw new AppError('', 500)
        }

        if(!process.env.MERCADOPAGO_ACCESS_TOKEN) {
            throw new AppError('', 500)
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.MERCADOPAGO_ACCESS_TOKEN ,
            'X-Idempotency-Key': v4()
        }

        try {
            const answer = await axios({
                method: "post",
                url: `https://api.mercadopago.com/v1/orders/${orderId}/cancel`, 
                headers,
            })

            if(answer.data.status === 'canceled') return true
            else return false

        } catch(error) {
            throw new AppError('', 500)
        }
    }

    async refundOrder(orderId: string) {
        if(!process.env.MERCADOPAGO_ACCESS_TOKEN) {
            throw new AppError('', 500)
        }

        if(!process.env.MERCADOPAGO_ACCESS_TOKEN) {
            throw new AppError('', 500)
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.MERCADOPAGO_ACCESS_TOKEN ,
            'X-Idempotency-Key': v4()
        }

        try {
            const answer = await axios({
                method: "post",
                url: `https://api.mercadopago.com/v1/orders/${orderId}/cancel`, 
                headers,
            })

            if(answer.data.status === 'refunded') return true
            else return false

        } catch(error) {
            throw new AppError('', 500)
        }
    }

    async getOrder(orderId: string) {
        if(!process.env.MERCADOPAGO_ACCESS_TOKEN) {
            throw new AppError('', 500)
        }

        if(!process.env.MERCADOPAGO_ACCESS_TOKEN) {
            throw new AppError('', 500)
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.MERCADOPAGO_ACCESS_TOKEN ,
        }

        try {
            const answer = await axios({
                method: "get",
                url: `https://api.mercadopago.com/v1/orders/${orderId}`, 
                headers,
            })

            if(answer.data.status === 'refunded') return true
            else return false

        } catch(error) {
            throw new AppError('', 500)
        }
    }

    async fetchCoordinates(params: CreateStoreParamsMP): Promise<{lat: string, lng: string} | void> {
        opencage
        .geocode({ q: `${params.address}, ${params.city}, Brazil` })
        .then((data) => {
            if (data.status.code === 200 && data.results.length > 0) {
                const place = data.results[0];
                
                return place.geometry
            } else {
                console.log('Status', data.status.message);
                console.log('total_results', data.total_results);
            }
        })
        .catch((error) => {
            console.log('Error', error.message);
            if (error.status.code === 402) {
                console.log('hit free trial daily limit');
                console.log('become a customer: https://opencagedata.com/pricing');
                throw new AppError('', 500)
            }
        });
    }

    generateVerifier() {
        return crypto.randomBytes(32).toString('base64url');
    }

    generateChallenge(verifier: string){
        const hash = crypto.createHash('sha256')
            .update(verifier)
            .digest();
        
        return hash.toString('base64url');
    }

    async getAccessTokenAuthorization() {
        const codeVerifier = this.generateVerifier()

        const codeChallenge = this.generateChallenge(codeVerifier)
        const codeMethod = 'S256'

        try {
            const answer = await axios({
                method: 'get',
                url: 'https://auth.mercadopago.com/authorization',
                params: {
                    redirect_uri: '', // TODO
                    code_challenge: codeChallenge,
                    code_challenge_method: codeMethod,
                    response_type: 'code'
                }
            })
        } catch(error) {
            throw new AppError('', 500)
        }
    }

    async setUserAuthURL() {
        if(!process.env.MERCADOPAGO_CLIENT_ID) {
            throw new AppError('', 500)
        }

        const random = v4()
        const returnURL = 'http://localhost:5174/process-oatuh'

        const url = `https://auth.mercadopago.com/authorization?client_id=${process.env.MERCADOPAGO_CLIENT_ID}&response_type=code&platform_id=mp&state=${random}&redirect_uri=${returnURL}`

        return url
    }

    async getOAuthtoken(codeVerifier: string, authCode: string) {

        const client = new MercadoPagoConfig({ accessToken: 'access_token', options: { timeout: 5000 } }); 

        const oauth = new OAuth(client);

        oauth.create({
            body: {
                client_id: '', // TODO
                client_secret: '', // TODO
                code: authCode,
                redirect_uri: '' // TODO,
            }
        }).then((result) => console.log(result))
	    .catch((error) => console.log(error));

    }

    async createSubscriptionOrder(params: CreateOrderSubscriptionMP): Promise<CreateOrderType> {
        if(!process.env.MERCADOPAGO_ACCESS_TOKEN) {
            throw new AppError('', 500)
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.MERCADOPAGO_ACCESS_TOKEN ,
            'X-Idempotency-Key': v4()
        }

        try {
            const answer = await axios({
                method: "post",
                url: "https://api.mercadopago.com/v1/orders", 
                headers,
                data: params
            })

            return answer.data

        } catch(error) {
            throw new AppError('', 500)
        }
    }

    async processOrder(orderId: string) {
        if(!process.env.MERCADOPAGO_ACCESS_TOKEN) {
            throw new AppError('', 500)
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.MERCADOPAGO_ACCESS_TOKEN ,
            'X-Idempotency-Key': v4()
        }

        try {
            const answer = await axios({
                method: "post",
                url: `https://api.mercadopago.com/v1/orders/${orderId}/process`, 
                headers
            })

            return answer.data

        } catch(error) {
            throw new AppError('', 500)
        }
    }

}


