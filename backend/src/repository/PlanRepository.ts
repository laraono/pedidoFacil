import { DataSource, Repository } from "typeorm";
import { Plan } from "../database";

export class PlanRepository extends Repository<Plan>{

    constructor(private dataSource: DataSource) {
        super(Plan, dataSource.createEntityManager());
    }

    async getPlan(planId: number) {
        return await this.findOne({
            where: {
                id: planId
            }
        })
    }

    async deletePlan(planId: number) {
        await this.delete(planId)
    }

    async listPlans() {
        return await this.find()
    }

}