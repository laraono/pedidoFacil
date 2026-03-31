import { Request, Response, NextFunction } from 'express';
import { MetricsService } from '../service/MetricsService';

const metricsService = new MetricsService();

export class MetricsController {
    
    async getMetrics(req: Request, res: Response, next: NextFunction) {
        try {
            // Pega o estabelecimento do payload do JWT validado pelo middleware
            const establishmentId = (req as any).usuario.estabelecimento;
            const { startDate, endDate } = req.query;

            if (!establishmentId) {
                return res.status(400).json({ error: 'Usuário não possui estabelecimento vinculado.' });
            }

            // Regra da task: Parâmetros de data obrigatórios
            if (!startDate || !endDate) {
                return res.status(400).json({ 
                    error: 'Os parâmetros de data (startDate e endDate) são obrigatórios na URL.' 
                });
            }

            const metrics = await metricsService.getDashboardMetrics(
                establishmentId,
                String(startDate),
                String(endDate)
            );

            return res.status(200).json(metrics);
        } catch (error) {
            next(error);
        }
    }
}