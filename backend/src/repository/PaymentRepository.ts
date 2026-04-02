import { DataSource, Repository } from "typeorm";
import { Payment } from "../database/entity/Payment";

export class PaymentRepository extends Repository<Payment> {
    constructor(private dataSource: DataSource) {
        super(Payment, dataSource.createEntityManager());
    }
}