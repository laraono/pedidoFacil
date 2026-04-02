import { Request, Response } from 'express';
import { EstablishmentService } from '../service/EstablishmentService';
import { catchAsync } from '../middleware';

export class EstablishmentController {
  
  private establishmentService: EstablishmentService;

  constructor(establishmentService: EstablishmentService) {
    this.establishmentService = establishmentService;
  }

  // O catchAsync abraça a função e envia qualquer erro automaticamente para o next()
  onboarding = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).usuario.id;
    const establishment = await this.establishmentService.saveOnboardingStep(userId, req.body);
    return res.status(201).json(establishment);
  });

  finalize = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).usuario.id;
    const result = await this.establishmentService.finalizeOnboarding(userId, req.body);
    return res.status(200).json(result);
  });

  getProfile = catchAsync(async (req: Request, res: Response) => {
    const establishmentId = (req as any).usuario.estabelecimento;
    const establishment = await this.establishmentService.getEstablishmentProfile(establishmentId);
    return res.status(200).json(establishment);
  });

  update = catchAsync(async (req: Request, res: Response) => {
    const establishmentId = (req as any).usuario.estabelecimento;
    const updated = await this.establishmentService.updateEstablishment(establishmentId, req.body);
    return res.status(200).json(updated);
  });

  disable = catchAsync(async (req: Request, res: Response) => {
    const establishmentId = (req as any).usuario.estabelecimento;
    const result = await this.establishmentService.softDeleteEstablishment(establishmentId);
    return res.status(200).json(result);
  });
}