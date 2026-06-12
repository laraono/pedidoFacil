import { /*CreateOrderPaymentMP, CreateOrderSubscriptionMP,*/ CreatePlanMercadoPago, /*CreateRegisterParamsMP, CreateStoreParamsMP,*/ UpdatePlanMercadoPago, UpdateSubscriptionMP } from '../dto';
import { AppError } from '../middleware';
import { auditLog } from '../utils/logger';
import axios from 'axios'
// import opencage from 'opencage-api-client';
// import crypto from 'crypto';
// import { MercadoPagoConfig, OAuth } from 'mercadopago'

// const v4 = () => crypto.randomUUID();

/*
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
                id: string,
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

type PaymentMethod = {
    id: string;
    type: string;
    token: string;
    installments: number
}
*/

export class MercadoPagoService {

    async createPlan(params: CreatePlanMercadoPago) {
        if(!process.env.MERCADOPAGO_ACCESS_TOKEN_ASSINATURA) {
            throw new AppError('Erro de conexão com o Mercado Pago',  500)
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.MERCADOPAGO_ACCESS_TOKEN_ASSINATURA 
        }

        try {
            const answer = await axios({
                method: "post",
                url: "https://api.mercadopago.com/preapproval_plan",
                data: params,
                headers
            })
            return answer.data
        } catch(error: any) {
            auditLog('mp.create_plan_error', { error: error?.message, response: error?.response?.data });
            throw new AppError('Erro criando plano', 500)
        }
    }

    async updatePlan(mercadoPagoId: string, params: UpdatePlanMercadoPago) {
        if(!process.env.MERCADOPAGO_ACCESS_TOKEN_ASSINATURA) {
            throw new AppError('Erro de conexão com o Mercado Pago',  500)
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.MERCADOPAGO_ACCESS_TOKEN_ASSINATURA 
        }

        try {
            const answer = await axios({
                method: "put",
                url: `https://api.mercadopago.com/preapproval_plan/${mercadoPagoId}`,
                data: params,
                headers
            })
            return answer.data
        } catch(error: any) {
            auditLog('mp.update_plan_error', { error: error?.message });
            throw new AppError('Erro criando plano', 500)
        }
    }

    async getPlans() {
        if(!process.env.MERCADOPAGO_ACCESS_TOKEN_ASSINATURA) {
            throw new AppError('Erro de conexão com o Mercado Pago',  500)
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.MERCADOPAGO_ACCESS_TOKEN_ASSINATURA 
        }

        try {
            const answer = await axios({
                method: "get",
                url: "https://api.mercadopago.com/preapproval_plan/search",
                headers
            })
            return answer.data
        } catch(err: any) {

            auditLog('mp.get_plans_error', { errors: err?.response?.data?.errors });
            throw new AppError('Erro buscando planos', 500)
        }
    }

    async createSubscription(
        params: {
            preapproval_plan_id: string,
            payer_email: string,
            card_token_id: string,
            reason: string,
            status: string
        }
    ) {
        if(!process.env.MERCADOPAGO_ACCESS_TOKEN_ASSINATURA) {
            throw new AppError('Erro de conexão com o Mercado Pago',  500)
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.MERCADOPAGO_ACCESS_TOKEN_ASSINATURA 
        }

        try {
            const answer = await axios({
                method: "post",
                url: "https://api.mercadopago.com/preapproval",
                data: params,
                headers
            })

            return answer.data
        } catch(err: any) {
            const mpError = err?.response?.data
            auditLog('mp.create_subscription_error', { error: mpError, params });
            throw new AppError('Ocorreu um erro no Mercado Pago. Verifique os dados do cartão e tente novamente.', 500)
        }
    }

    async getSubscription(mercadoPagoId: string) {
        if(!process.env.MERCADOPAGO_ACCESS_TOKEN_ASSINATURA) {
            throw new AppError('Erro de conexão com o Mercado Pago',  500)
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.MERCADOPAGO_ACCESS_TOKEN_ASSINATURA 
        }

        try {
            const answer = await axios({
                method: "get",
                url: `https://api.mercadopago.com/preapproval/${mercadoPagoId}/`,
                headers
            })

            return {
                status: answer.data.status as string,
                next_payment_date: answer.data.next_payment_date as string | null,
                payer_email: answer.data.payer_email as string | null
            }
        } catch(error: any) {
            auditLog('mp.get_subscription_error', { error: error?.response?.data ?? error?.message });
            throw new AppError('Erro ao consultar assinatura no Mercado Pago', 500)
        }
    }

    async updateSubscriptionValue(params: UpdateSubscriptionMP) {
        if(!process.env.MERCADOPAGO_ACCESS_TOKEN_ASSINATURA) {
            throw new AppError('Erro de conexão com o Mercado Pago',  500)
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.MERCADOPAGO_ACCESS_TOKEN_ASSINATURA 
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

        } catch(error: any) {
            auditLog('mp.update_subscription_value_error', { error: error?.response?.data ?? error?.message });
            throw new AppError('Erro de conexão com o Mercado Pago',  500)
        }
    }

    async cancelSubscription(subscriptionId: string) {
        if(!process.env.MERCADOPAGO_ACCESS_TOKEN_ASSINATURA) {
            throw new AppError('Erro de conexão com o Mercado Pago',  500)
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.MERCADOPAGO_ACCESS_TOKEN_ASSINATURA 
        }

        const status = {status: 'cancelled'}

        try {
            const answer = await axios({
                method: "put",
                url: `https://api.mercadopago.com/preapproval/${subscriptionId}`, 
                data: status,
                headers
            })

            return answer.data.id

        } catch(error: any) {
            auditLog('mp.cancel_subscription_error', { error: error?.response?.data ?? error?.message });
            throw new AppError('Erro de conexão com o Mercado Pago',  500)
        }
    }

    async getPayment(paymentId: string): Promise<{
        status: string
        preapproval_id: string | null
        transaction_amount: number
        payment_type_id: string
        installments: number | null
    }> {
        if(!process.env.MERCADOPAGO_ACCESS_TOKEN_ASSINATURA) {
            throw new AppError('Erro de conexão com o Mercado Pago', 500)
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.MERCADOPAGO_ACCESS_TOKEN_ASSINATURA
        }

        try {
            const answer = await axios({
                method: 'get',
                url: `https://api.mercadopago.com/v1/payments/${paymentId}`,
                headers
            })
            return {
                status: answer.data.status,
                preapproval_id: answer.data.metadata?.preapproval_id ?? answer.data.preapproval_id ?? null,
                transaction_amount: answer.data.transaction_amount ?? 0,
                payment_type_id: answer.data.payment_type_id ?? '',
                installments: answer.data.installments ?? null,
            }
        } catch(error: any) {
            auditLog('mp.get_payment_error', { error: error?.response?.data ?? error?.message });
            throw new AppError('Erro ao consultar pagamento no Mercado Pago', 500)
        }
    }

    async getPaymentsByPreapproval(preapprovalId: string): Promise<any[]> {
        if(!process.env.MERCADOPAGO_ACCESS_TOKEN_ASSINATURA) {
            throw new AppError('Erro de conexão com o Mercado Pago', 500)
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.MERCADOPAGO_ACCESS_TOKEN_ASSINATURA
        }

        try {
            const answer = await axios({
                method: 'get',
                url: 'https://api.mercadopago.com/v1/payments/search',
                headers,
                params: { preapproval_id: preapprovalId }
            })
            return answer.data.results ?? []
        } catch(error: any) {
            auditLog('mp.get_payments_by_preapproval_error', { error: error?.response?.data ?? error?.message });
            throw new AppError('Erro ao buscar pagamentos da assinatura', 500)
        }
    }

    async updateSubscriptionCard(preapprovalId: string, cardToken: string): Promise<void> {
        if(!process.env.MERCADOPAGO_ACCESS_TOKEN_ASSINATURA) {
            throw new AppError('Erro de conexão com o Mercado Pago', 500)
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.MERCADOPAGO_ACCESS_TOKEN_ASSINATURA
        }

        try {
            await axios({
                method: 'put',
                url: `https://api.mercadopago.com/preapproval/${preapprovalId}`,
                headers,
                data: { card_token_id: cardToken }
            })
        } catch(error: any) {
            auditLog('mp.update_subscription_card_error', { error: error?.response?.data ?? error?.message });
            throw new AppError('Erro ao atualizar cartão da assinatura', 500)
        }
    }

    /*
    async createStore(params: CreateStoreParamsMP) {
        if(!process.env.MERCADOPAGO_ACCESS_TOKEN_CHECKOUT || !process.env.MERCADOPAGO_USER_ID) {
            throw new AppError('Erro de conexão com o Mercado Pago',  500)
        }

        const coordinates = await this.fetchCoordinates(params)

        if(!coordinates) {
            throw new AppError('Erro de conexão com o Mercado Pago',  500)
        }

        const address = params.address.split(',')

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.MERCADOPAGO_ACCESS_TOKEN_CHECKOUT
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

        } catch(error: any) {
            auditLog('mp.create_store_error', { error: error?.message });
            throw new AppError('Erro de conexão com o Mercado Pago',  500)
        }
    }

    async createRegister(params: CreateRegisterParamsMP) {
        if(!process.env.MERCADOPAGO_ACCESS_TOKEN_TERMINAL) {
            throw new AppError('Erro de conexão com o Mercado Pago',  500)
        }

        const register = {
            name: params.name,
            store_id: params.mercadoPagoId,
            category: 5611203
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.MERCADOPAGO_ACCESS_TOKEN_TERMINAL
        }

        try {
            const answer = await axios({
                method: "post",
                url: "https://api.mercadopago.com/pos",
                data: register,
                headers
            })

            return answer.data.id

        } catch(error: any) {
            auditLog('mp.create_register_error', { error: error?.response?.data ?? error?.message });
            throw new AppError('Erro de conexão com o Mercado Pago',  500)
        }
    }

    async getTerminals({ store, pos }: { store?: string; pos?: string }) {
        if (!process.env.MERCADOPAGO_ACCESS_TOKEN_TERMINAL) {
            throw new AppError('Credenciais do Mercado Pago não configuradas.', 500);
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN_TERMINAL}`
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
        } catch (error: any) {
            auditLog('mp.get_terminals_error', { error: error?.response?.data ?? error?.message });
            throw new AppError('Erro ao buscar terminais', 500);
        }
    }

    async activeTerminal(terminalId: string) {
        if (!process.env.MERCADOPAGO_ACCESS_TOKEN_TERMINAL) {
            throw new AppError('Credenciais do Mercado Pago não configuradas.', 500);
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN_TERMINAL}`
        };

        try {
            const response = await axios({
                method: "patch",
                url: `https://api.mercadopago.com/terminals/v1/setup`,
                headers,
                data: {
                    id: terminalId,
                    operating_mode: "PDV"
                }
            });

            return response.data.terminals;
        } catch (error: any) {
            auditLog('mp.activate_terminal_error', { error: error?.response?.data ?? error?.message });
            throw new AppError('Erro ao ativar terminal', 500);
        }
    }

    async createOrder(params: CreateOrderPaymentMP): Promise<CreateOrderType> {
        if(!process.env.MERCADOPAGO_ACCESS_TOKEN_TERMINAL) {
            throw new AppError('Erro de conexão com o Mercado Pago',  500)
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
            'Authorization': 'Bearer ' + process.env.MERCADOPAGO_ACCESS_TOKEN_TERMINAL,
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

        } catch(error: any) {
            auditLog('mp.create_order_error', { error: error?.response?.data ?? error?.message });
            throw new AppError('Erro de conexão com o Mercado Pago',  500)
        }
    }

    async updateOrder(orderId: string, transactionId: string, payment_method: PaymentMethod) {
        if(!process.env.MERCADOPAGO_ACCESS_TOKEN_CHECKOUT) {
            throw new AppError('Erro de conexão com o Mercado Pago',  500)
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.MERCADOPAGO_ACCESS_TOKEN_CHECKOUT ,
            'X-Idempotency-Key': v4()
        }

        try {
            const answer = await axios({
                method: "put",
                url: `https://api.mercadopago.com/v1/orders/${orderId}/transactions/${transactionId}`,
                headers,
                data: payment_method
            })

            if(answer.data.status === 'canceled') return true
            else return false

        } catch(error: any) {
            auditLog('mp.update_order_error', { error: error?.response?.data ?? error?.message });
            throw new AppError('Erro de conexão com o Mercado Pago',  500)
        }
    }

    async cancelOrder(orderId: string) {
        if(!process.env.MERCADOPAGO_ACCESS_TOKEN_CHECKOUT) {
            throw new AppError('Erro de conexão com o Mercado Pago',  500)
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.MERCADOPAGO_ACCESS_TOKEN_CHECKOUT ,
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

        } catch(error: any) {
            auditLog('mp.cancel_order_error', { error: error?.response?.data ?? error?.message });
            throw new AppError('Erro de conexão com o Mercado Pago',  500)
        }
    }

    async refundOrder(orderId: string) {
        if(!process.env.MERCADOPAGO_ACCESS_TOKEN_CHECKOUT) {
            throw new AppError('Erro de conexão com o Mercado Pago',  500)
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.MERCADOPAGO_ACCESS_TOKEN_CHECKOUT ,
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

        } catch(error: any) {
            auditLog('mp.refund_order_error', { error: error?.response?.data ?? error?.message });
            throw new AppError('Erro de conexão com o Mercado Pago',  500)
        }
    }

    async getOrder(orderId: string) {
        if(!process.env.MERCADOPAGO_ACCESS_TOKEN_CHECKOUT) {
            throw new AppError('Erro de conexão com o Mercado Pago',  500)
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.MERCADOPAGO_ACCESS_TOKEN_CHECKOUT ,
        }

        try {
            const answer = await axios({
                method: "get",
                url: `https://api.mercadopago.com/v1/orders/${orderId}`,
                headers,
            })

            return answer.data

        } catch(error: any) {
            auditLog('mp.get_order_error', { error: error?.response?.data ?? error?.message });
            throw new AppError('Erro ao conectar ao Mercado Pago', 500)
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
                auditLog('mp.geocode_no_results', { status: data.status.message, total: data.total_results });
            }
        })
        .catch((error: any) => {
            if (error.status?.code === 402) {
                auditLog('mp.geocode_rate_limit', { error: error.message });
                throw new AppError('Erro de conexão com o Mercado Pago',  500)
            }
            auditLog('mp.geocode_error', { error: error?.message });
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
        } catch(error: any) {
            auditLog('mp.get_access_token_error', { error: error?.response?.data ?? error?.message });
            throw new AppError('Erro de conexão com o Mercado Pago',  500)
        }
    }

    async setUserAuthURL() {
        if(!process.env.MERCADOPAGO_CLIENT_ID) {
            throw new AppError('Erro de conexão com o Mercado Pago',  500)
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
        }).then(() => {})
	    .catch((error: any) => auditLog('mp.oauth_error', { error: error?.message }));

    }


    async createTotemPayment(formData: any, amount: number, description: string) {
        if (!process.env.MERCADOPAGO_ACCESS_TOKEN_CHECKOUT) {
            throw new AppError('Credenciais do Mercado Pago não configuradas', 500);
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN_CHECKOUT}`,
            'X-Idempotency-Key': v4()
        };

        const paymentBody = {
            ...formData,
            transaction_amount: amount,
            description
        };

        try {
            const response = await axios.post(
                'https://api.mercadopago.com/v1/payments',
                paymentBody,
                { headers }
            );

            const data = response.data;

            return {
                id: data.id,
                status: data.status,
                statusDetail: data.status_detail,
                pixQrCode: data.point_of_interaction?.transaction_data?.qr_code ?? null,
                pixQrCodeBase64: data.point_of_interaction?.transaction_data?.qr_code_base64 ?? null,
                pixExpiresAt: data.date_of_expiration ?? null
            };
        } catch (err: any) {
            auditLog('mp.create_totem_payment_error', { error: err?.response?.data ?? err?.message });
            const msg = err.response?.data?.message ?? 'Erro ao processar pagamento';
            throw new AppError(msg, err.response?.status ?? 500);
        }
    }

    async processCardInfo(userId: string, token: string) {
        if(!process.env.MERCADOPAGO_ACCESS_TOKEN_ASSINATURA) {
            throw new AppError('Erro de conexão com o Mercado Pago',  500)
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.MERCADOPAGO_ACCESS_TOKEN_ASSINATURA ,
            'X-Idempotency-Key': crypto.randomUUID()
        }

        try {
            const answer = await axios({
                method: "post",
                url: `https://api.mercadopago.com/v1/customers/${userId}/cards`,
                headers,
                data: {
                    token
                }
            })

            return answer.data

        } catch(err: any) {

            auditLog('mp.totem_payment_error', { error: err?.response?.data });
            throw new AppError(err.response.data.message, 500)
        }
    }
    */

    /*
    async processOrder(orderId: string) {
        if(!process.env.MERCADOPAGO_ACCESS_TOKEN_CHECKOUT) {
            throw new AppError('Erro de conexão com o Mercado Pago',  500)
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.MERCADOPAGO_ACCESS_TOKEN_CHECKOUT ,
            'X-Idempotency-Key': v4()
        }

        try {
            const answer = await axios({
                method: "post",
                url: `https://api.mercadopago.com/v1/orders/${orderId}/process`,
                headers
            })

            return answer.data

        } catch(error:any) {
            auditLog('mp.process_order_error', { error: error?.response?.data });
            throw new AppError(error.response.data.message, 500)
        }
    }

    async createSubscriptionOrder(params: CreateOrderSubscriptionMP): Promise<CreateOrderType> {
        if(!process.env.MERCADOPAGO_ACCESS_TOKEN_CHECKOUT) {
            throw new AppError('Erro de conexão com o Mercado Pago',  500)
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.MERCADOPAGO_ACCESS_TOKEN_CHECKOUT ,
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

        } catch(error: any) {
            auditLog('mp.create_subscription_order_error', { error: error?.response?.data ?? error?.message });
            if( error.response.data.errors) {
                for(const e of  error.response.data.errors) {
                    throw new AppError(e.message, 500)
                }
            }
            throw new AppError('Erro de conexão com o Mercado Pago',  500)
        }
    }
    */

}


