import { DataSource, Repository } from "typeorm";
import { Plan, Subscription } from "../database";
import { CreateSubscription } from "../dto";
import { SubscriptionStatus } from "../enum";
import { STATUS_ASSINATURA_IDS } from "../database/entity/lookup-ids";

export class SubscriptionRepository extends Repository<Subscription>{

    constructor(dataSource: DataSource) {
        super(Subscription, dataSource.createEntityManager());
    }

    async createSubscription(subscription: CreateSubscription) {
        return await this.save(subscription)
    }

    async getSubscription(subscriptionId: number) {
        return await this.findOne({
            where: { id: subscriptionId },
            relations: { plan: true }
        })
    }

    async listSubscriptions(status?: SubscriptionStatus, name?: string) {
        return await this.find({
            relations: {
                establishment: { manager: true, roles: { users: true } },
                plan: true,
            },
            select: {
                expirationDate: true,
                id: true,
                status: { id: true, nome: true },
                plan: { id: true, name: true, price: true },
                establishment: {
                    id: true,
                    name: true,
                    manager: { id: true, name: true },
                    roles: { id: true, users: { id: true } },
                }
            },
            where: (() => {
                const w: any = {};
                if (status) w.status = { nome: status };
                if (name) w.plan = { name };
                return w;
            })()
        })
    }

    async listSubscriptionsByPlan(plan: Plan) {
        return await this.find({ where: { plan } })
    }

    async getSubscriptionByEstablishment(establishmentId: number) {
        return await this.find({
            where: { establishment: { id: establishmentId } },
            order: { id: 'DESC' },
            relations: { establishment: true, plan: true }
        })
    }

    async deleteSubscription(subscriptionId: number) {
        await this.softDelete(subscriptionId)
    }

    async updateSubscriptionStatus(subscriptionId: number, status: SubscriptionStatus) {
        const statusIdMap: Record<SubscriptionStatus, number> = {
            [SubscriptionStatus.PENDENTE]:  STATUS_ASSINATURA_IDS.PENDENTE,
            [SubscriptionStatus.PAGA]:      STATUS_ASSINATURA_IDS.PAGA,
            [SubscriptionStatus.EXPIRADA]:  STATUS_ASSINATURA_IDS.EXPIRADA,
            [SubscriptionStatus.CANCELADA]: STATUS_ASSINATURA_IDS.CANCELADA,
        };
        const statusFK = { id: statusIdMap[status] } as any;

        if (status === SubscriptionStatus.PAGA) {
            const subscription = await this.findOne({ where: { id: subscriptionId }, relations: { plan: true } });
            const expirationDate = new Date();
            if (subscription?.plan?.frequency === 'anual') {
                expirationDate.setFullYear(expirationDate.getFullYear() + 1);
            } else {
                expirationDate.setMonth(expirationDate.getMonth() + 1);
            }
            await this.update(subscriptionId, { status: statusFK, expirationDate } as any);
        } else {
            await this.update(subscriptionId, { status: statusFK } as any);
        }
    }

    async updateSubscriptionPrice(subscriptionId: number, price: number) {
        await this.update(subscriptionId, { price })
    }
}
