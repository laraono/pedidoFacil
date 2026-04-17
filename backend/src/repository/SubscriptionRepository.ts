import { DataSource, Repository } from "typeorm";
import { Subscription } from "../database";
import { CreateSubscription } from "../dto";
import { SubscriptionStatus } from "../enum";

export class SubscriptionRepository extends Repository<Subscription>{

    constructor(private dataSource: DataSource) {
        super(Subscription, dataSource.createEntityManager());
    }

    async createSubscription(subscription: CreateSubscription) {
        return await this.save(subscription)
    }

    async getSubscription(subscriptionId: number) {
        return await this.findOne({
            where: {
                id: subscriptionId
            }
        })
    }

    async deleteSubscription(subscriptionId: number) {
        await this.softDelete(subscriptionId)
    }

    async updateSubscriptionStatus(subscriptionId: number, status: SubscriptionStatus) {
        await this.update(subscriptionId, {status})
    }

}