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
        const comandas = await this.comandaService.listComandas()

        res.status(200).send(comandas)
    }

    async listComandasByStatus(req: Request, res: Response) {
        const {status} = req.query

        const comandas = await this.comandaService.listComandasByStatus(status as any);

        res.status(200).send(comandas)
    }
    
    async updateComandaStatus(req: Request, res: Response) {
        const { id } = req.params;

        const idNumero = Number(id);

        await this.comandaService.updateComandaStatus(idNumero, req.body);
        
        res.sendStatus(204);
    }

    async cancelComanda(req: Request, res: Response) {
        const { comandaId} = req.params

        await this.comandaService.cancelComanda({comandaId, ...req.body})
        
        res.sendStatus(204)
    }
    
}