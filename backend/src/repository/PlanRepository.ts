import { DataSource, Repository } from "typeorm";
import { Plan } from "../database";
import { CreatePlan } from "../dto";

export class PlanRepository extends Repository<Plan>{

    constructor(private dataSource: DataSource) {
        super(Plan, dataSource.createEntityManager());
    }

    async createPlan(plan: CreatePlan) {
        return await this.save(plan)
    }

    async getPlan(planId: number) {
        return await this.findOne({
            where: {
                id: planId
            }
        })
    }

    async deletePlan(planId: number) {
        await this.softDelete(planId)
    }

    async listPlans() {
        return await this.find()
    }

}