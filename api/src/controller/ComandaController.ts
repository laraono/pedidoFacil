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
    
}