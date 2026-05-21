import { Request, Response } from 'express';
import { EstablishmentService } from '../service/EstablishmentService';
import { catchAsync } from '../middleware';
import { getIO } from '../socket';
import { deleteFile } from '../utils/fileHelper';

export class EstablishmentController {
  
  private establishmentService: EstablishmentService;

  constructor(establishmentService: EstablishmentService) {
    this.establishmentService = establishmentService;
  }

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
  
  getPublicProfile = catchAsync(async (req: Request, res: Response) => {
    const establishmentId = Number(req.params.id);
    const establishment = await this.establishmentService.getEstablishmentProfile(establishmentId);
    
    return res.status(200).json({
      name: establishment.name,
      paymentMethods: establishment.paymentMethods,
      selfServiceEnabled: establishment.selfServiceEnabled,
      configurations: establishment.configurations 
    });
  });

  getByCode = catchAsync(async (req: Request, res: Response) => {
    const code = req.params.code as string;
    
    const establishment = await this.establishmentService.validateAccessCode(code);

    return res.status(200).json({
      id: establishment.id, 
      name: establishment.name,
      selfServiceCode: establishment.selfServiceCode,
      configurations: establishment.configurations
    });
  });

  update = catchAsync(async (req: Request, res: Response) => {
    const establishmentId = (req as any).usuario.estabelecimento;
    let updateData = { ...req.body };

    if (typeof updateData.paymentMethods === 'string') {
      updateData.paymentMethods = JSON.parse(updateData.paymentMethods);
    }
    
    if (updateData.selfServiceEnabled === 'true' || updateData.selfServiceEnabled === 'false') {
      updateData.selfServiceEnabled = updateData.selfServiceEnabled === 'true';
    }

    if (updateData.pixStaticEnabled === 'true' || updateData.pixStaticEnabled === 'false') {
      updateData.pixStaticEnabled = updateData.pixStaticEnabled === 'true';
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    if (files?.logo?.[0]) {
      const oldProfile = await this.establishmentService.getEstablishmentProfile(establishmentId);
      if (oldProfile?.configurations?.logo) {
        deleteFile(oldProfile.configurations.logo);
      }
      updateData.configurations = {
        ...updateData.configurations,
        logo: files.logo[0].filename
      };
    }

    if (files?.pixQrCode?.[0]) {
      const oldProfile = await this.establishmentService.getEstablishmentProfile(establishmentId);
      if (oldProfile?.pixQrCodeUrl && !oldProfile.pixQrCodeUrl.startsWith('http')) {
        deleteFile(oldProfile.pixQrCodeUrl);
      }
      updateData.pixQrCodeUrl = files.pixQrCode[0].filename;
    }

    const updated = await this.establishmentService.updateEstablishment(establishmentId, updateData);
    
    getIO().emit('profile_updated');

    return res.status(200).json(updated);
  });

  disable = catchAsync(async (req: Request, res: Response) => {
    const establishmentId = (req as any).usuario.estabelecimento;
    const result = await this.establishmentService.softDeleteEstablishment(establishmentId);
    return res.status(200).json(result);
  });

}