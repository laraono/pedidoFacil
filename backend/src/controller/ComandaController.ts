import { ComandaService } from "../service";
import {Request, Response} from 'express';

export class ComandaController {

    private comandaService: ComandaService

    constructor(comandaService: ComandaService) {
        this.comandaService = comandaService
    }

    async createComanda(req: Request, res: Response) {
        const comandaId = await this.comandaService.createComanda(req.body)

        res.status(201).send(comandaId)
    }

    async listComandas(req: Request, res: Response) {
        const comandas = await this.comandaService.listComandas(req.body)

        res.status(200).send(comandas)
    }

    async listComandasByStatus(req, res: Response) {

        const comandas = await this.comandaService.listComandasByStatus(req.query)

        res.status(200).send(comandas)
    }
    
    async updateComandaStatus(req, res: Response) {
        await this.comandaService.updateComandaStatus(req.params, req.body)
        
        res.sendStatus(204)
    }

    async cancelComanda(req, res: Response) {
        const { comandaId} = req.params

        await this.comandaService.cancelComanda({comandaId, ...req.body})
        
        res.sendStatus(204)
    }
    
}