import { DataSource, Repository } from "typeorm";
import { Plan, Subscription } from "../database";
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
            },
            relations: {
                plan: true
            }
        })
    }

    async listSubscriptions(status?: SubscriptionStatus, name?: string) {

        return await this.find({
            relations: {
                establishment: {
                    users: {
                        role: true
                    }
                },
                plan: true,
            },
            select: {
                expirationDate: true,
                id: true,
                status: true,
                plan: {
                    id: true,
                    name: true,
                    price: true
                },
                establishment: {
                    id: true,
                    name: true,
                    users: {
                        id: true,
                        name: true,
                        role: true
                    }
                }
            },
            where: {
                ...(status && { status }),
                ...(name && { plan: { name } }),
            }
        })
    }

    async listSubscriptionsByPlan(plan: Plan) {
        return await this.find({
            where: {
                plan
            }
        })
    }

    async getSubscriptionByEstablishment(establishmentId: number) {
        return await this.find({
            where: {
                establishment: {
                    id: establishmentId
                }
            },
            order: {
                id: 'DESC'
            },
            relations: {
                establishment: true,
                plan: true
            }
        })
    }

    async deleteSubscription(subscriptionId: number) {
        await this.softDelete(subscriptionId)
    }

    async updateSubscriptionStatus(subscriptionId: number, status: SubscriptionStatus) {
        await this.update(subscriptionId, {status})
    }

    async updateSubscriptionPrice(subscriptionId: number, price: number) {
        await this.update(subscriptionId, {price})
    }

}