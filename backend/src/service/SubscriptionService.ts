import { rootCertificates } from "node:tls"

export class SubscriptionService {

    async createSubscription(email: string, planId: number) {
        criar assinatura aqui e no mercado pago 
        salvar dado cartão
    }

    async paySubscription() {
        cria o plano e ai vincula uma subscription e o primeiro está pago 
        cria o proximo plano
        se status pagamento pendente e data de pagamento maior que hoje bloquear rotas 
    }
}