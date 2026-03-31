import { Request, Response, NextFunction } from 'express';
import { EstablishmentService } from '../service/EstablishmentService';

const establishmentService = new EstablishmentService();

export class EstablishmentController {
  async onboarding(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).usuario.id;
      const establishment = await establishmentService.saveOnboardingStep(
        userId,
        req.body,
      );
      return res.status(201).json(establishment);
    } catch (error) {
      next(error);
    }
  }

  async finalize(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).usuario.id;
      // Removido: const establishmentId = (req as any).usuario.estabelecimento;
      const { roles, hasTotem } = req.body;

      // Passamos apenas o userId. O Service vai buscar o estabelecimento correto no banco.
      const result = await establishmentService.finalizeOnboarding(
        userId,
        roles,
        hasTotem,
      );
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const establishmentId = (req as any).usuario.estabelecimento;
      const establishment =
        await establishmentService.getEstablishmentProfile(establishmentId);
      return res.status(200).json(establishment);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const establishmentId = (req as any).usuario.estabelecimento;
      const updated = await establishmentService.updateEstablishment(
        establishmentId,
        req.body,
      );
      return res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }

  async disable(req: Request, res: Response, next: NextFunction) {
    try {
      const establishmentId = (req as any).usuario.estabelecimento;
      const result =
        await establishmentService.softDeleteEstablishment(establishmentId);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}