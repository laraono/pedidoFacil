import { Request, Response } from 'express';
import { PlanService } from '../service/PlanService';
import { catchAsync } from '../middleware/error/catchAsync';

export class PlanController {
    private planService: PlanService;

    constructor(planService: PlanService) {
        this.planService = planService;
    }

    createPlan = catchAsync(async (req: Request, res: Response) => { 
        const plan = await this.planService.createPlan(req.body)
        return res.status(201).json(plan);
    });

    updatePlan = catchAsync(async (req, res: Response) => { 
        const {planId} = req.params
        await this.planService.updatePlan(planId, req.body)
        return res.sendStatus(204);
    });

    listPlans = catchAsync(async (req: Request, res: Response) => {
        const plans = await this.planService.listPlans();
        return res.status(200).json(plans);
    });

    getPlan = catchAsync(async (req, res: Response) => {
        const plan = await this.planService.getPlan(req.params.planId);
        return res.status(200).json(plan);
    });

    deletePlan = catchAsync(async (req, res: Response) => {
        await this.planService.deletePlan(req.params.planId);
        return res.sendStatus(204);
    });
}