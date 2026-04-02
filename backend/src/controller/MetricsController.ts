import { Request, Response } from 'express';
import { MetricsService } from '../service/MetricsService';
import { catchAsync } from '../middleware/error/catchAsync';

export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  getReceiptMetrics = catchAsync(async (req: Request, res: Response) => {
    const establishmentId = (req as any).usuario.estabelecimento;
    const { startDate, endDate } = req.query;

    const metrics = await this.metricsService.getReceiptMetrics(
      establishmentId,
      String(startDate),
      String(endDate),
    );

    return res.json(metrics);
  });
}
