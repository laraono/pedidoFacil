import { ComandaService } from "../service";
import { Request, Response } from 'express';
import { auditLog } from "../utils/logger";
import { getIO } from "../socket";
import { ComandaStatus } from "../enum";

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
            auditLog('create_comanda.failure', {
                ip: req.ip,
                timestamp: new Date().toISOString(),
            });
            
            return res.status(500).json({ error: "Erro interno ao criar comanda" });
        }
    }

    async listComandas(req: Request, res: Response) {
        const estabelecimentoId = (req as any).usuario.estabelecimento; 
        const comandas = await this.comandaService.listComandas(estabelecimentoId);
        res.status(200).send(comandas);
    }

    async listComandasByStatus(req: Request, res: Response) {
        const estabelecimentoId = (req as any).usuario.estabelecimento;
        const comandas = await this.comandaService.listComandasByStatus(ComandaStatus.ABERTA, estabelecimentoId);
        res.status(200).send(comandas);
    }

    async listComandasHistory(req: Request, res: Response) {
        const estabelecimentoId = (req as any).usuario.estabelecimento; 
        const comandas = await this.comandaService.listComandasHistory(estabelecimentoId);
        res.status(200).send(comandas);
    }
    
    async updateComandaStatus(req: Request, res: Response) {
        const { id } = req.params;
        const idNumero = Number(id || req.params.comandaId); 

        try {
            await this.comandaService.updateComandaStatus(idNumero, req.body.status);
            
            auditLog('update_comanda_status.success', {
                comandaId: idNumero,
                ip: req.ip,
                timestamp: new Date().toISOString(),
            });

            res.sendStatus(204);
         } catch (error) {
            auditLog('update_comanda_status.failure', {
                comandaId: idNumero,
                ip: req.ip,
                timestamp: new Date().toISOString(),
            });
            
            return res.status(500).json({ error: "Erro interno ao atualizar comanda." });
        }
    }

    async cancelComanda(req: Request, res: Response) {
        const { comandaId } = req.params;

        await this.comandaService.cancelComanda({
            comandaId: Number(comandaId), 
            ...req.body
        });
        
        getIO().to('cashier').to('kitchen').emit('comanda_cancelled', {
            comandaId: Number(comandaId)
        });

        res.sendStatus(204);
    }

    async processPayment(req: Request, res: Response) {
        const { comandaId } = req.params;
        const user = (req as any).user || (req as any).usuario; 

        try {
            if (!user) {
                return res.status(401).json({ error: "Sessão inválida." });
            }

            const userId = user.id || user.ID_Usuario;
            const estabelecimentoId = user.estabelecimento || user.ID_Estabelecimento;

            if (!userId || !estabelecimentoId) {
                return res.status(400).json({ error: "Token inválido." });
            }
            
            const result = await this.comandaService.processPartialPayment(
                Number(comandaId),
                Number(userId),
                Number(estabelecimentoId),
                req.body.payment,
                req.body.selectedOrderIds,
                req.body.isLastPayment, 
                req.body.cpfcnpj,
                req.body.discountType,  
                req.body.discountValue, 
                req.body.couponId       
            );

            auditLog('checkout.success', {
                comandaId: Number(comandaId),
                userId: userId,
                ip: req.ip,
                timestamp: new Date().toISOString(),
            });

            return res.status(200).json(result);

        } catch (error: any) {
            auditLog('checkout.failure', {
                comandaId: Number(comandaId),
                ip: req.ip,
                timestamp: new Date().toISOString(),
                error: error.message,
            });

            return res.status(500).json({ error: error.message || "Erro interno ao processar o pagamento." });
        }
    }
}