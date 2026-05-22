import { DataSource, Repository } from "typeorm";
import { Payment } from "../database/entity/Payment";

export class PaymentRepository extends Repository<Payment> {
    constructor(private dataSource: DataSource) {
        super(Payment, dataSource.createEntityManager());
    }

    async saveMercadoPagoInfo(paymentId: number, mercadoPagoOrderId: string, mercadoPagoPaymentId: string) {
        await this.update(paymentId, {mercadoPagoOrderId, mercadoPagoPaymentId})
    }

    async getPaymentByMercadoPagoId(mercadoPagoId: string) {
        return await this.findOne({
            where: {
                mercadoPagoPaymentId: mercadoPagoId
            }
        })
    }
}