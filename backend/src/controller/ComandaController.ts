import { ComandaStatus } from "../enum";
import { ComandaService } from "../service";
import {  Request, Response  } from 'express';
import { getIO } from "../socket";

export class ComandaController {
    private comandaService: ComandaService

    constructor(comandaService: ComandaService) {
        this.comandaService = comandaService
    }

    async createComanda(req: Request, res: Response) {
        try {
            const usuario = (req as any).usuario;

            if (!usuario || !usuario.estabelecimento) {
                return res.status(401).json({ message: "Estabelecimento não identificado." });
            }

            const comandaData = {
                ...req.body,
                establishment: { id: usuario.estabelecimento } 
            };

            const novaComanda = await this.comandaService.createComanda(comandaData);
            
            return res.status(201).json(novaComanda); 
        } catch (error) {
            console.error("Erro ao criar comanda:", error);
            return res.status(500).json({ error: "Erro interno ao criar comanda" });
        }
    }

    async listComandas(req: Request, res: Response) {
        const comandas = await this.comandaService.listComandas(req.body)

        res.status(200).send(comandas)
    }

    async listOpenComandas(req, res: Response) {
        const comandas = await this.comandaService.listComandasByStatus({status: ComandaStatus.ABERTA, establishmentId: req.body.establishmentId})
        res.status(200).send(comandas)
    }

    async listComandasByStatus(req: Request, res: Response) {
        const { status } = req.query;
        const comandas = await this.comandaService.listComandasByStatus(status as any);
        res.status(200).send(comandas);
    }
    
    async updateComandaStatus(req: Request, res: Response) {
        const { id } = req.params;
        const idNumero = Number(id || req.params.comandaId); 

        await this.comandaService.updateComandaStatus(idNumero, req.body.status);
        getIO().to('kitchen').to('cashier').emit('comanda_status_updated', {
            comandaId: idNumero,
            status: req.body.status
        })
        res.sendStatus(204);
    }

    async cancelComanda(req: Request, res: Response) {
        const { comandaId } = req.params;

        await this.comandaService.cancelComanda({
            comandaId: Number(comandaId), 
            ...req.body
        });

        getIO().to('kitchen').to('cashier').emit('comanda_status_updated', {
            comandaId: comandaId,
            status: ComandaStatus.CANCELADA
        })

        res.sendStatus(204);
    }

    async getComanda(req, res: Response) {
        const {comandaId} = req.params

        const comanda = await this.comandaService.getComanda(comandaId)

        res.status(200).send(comanda)
    }

    async checkout(req: Request, res: Response) {
        try {
            const { comandaId } = req.params;
            const user = (req as any).user || (req as any).usuario; 
            
            if (!user) {
                return res.status(401).json({ error: "Sessão inválida: Usuário não encontrado no request." });
            }

            const userId = user.id || user.ID_Usuario;
            const estabelecimentoId = user.estabelecimento || user.ID_Estabelecimento;

            if (!userId || !estabelecimentoId) {
                console.error("🔥 Token JWT sem ID ou Estabelecimento:", user);
                return res.status(400).json({ error: "Token inválido ou incompleto." });
            }

            const payment = await this.comandaService.checkoutComanda(
                Number(comandaId),
                Number(userId),
                Number(estabelecimentoId),
                req.body
            );

            getIO().to('kitchen').to('cashier').emit('comanda_status_updated', {
                comandaId,
                status: ComandaStatus.FECHADA
            })

            return res.status(200).json(payment);

        } catch (error: any) {
            console.error("🔥 ERRO FATAL NO BACKEND (Checkout):", error);
            return res.status(500).json({ error: "Erro interno ao processar o pagamento." });
        }
    }
}