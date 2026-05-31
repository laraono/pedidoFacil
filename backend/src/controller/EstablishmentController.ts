import { Request, Response } from 'express';
import { EstablishmentService } from '../service/EstablishmentService';
import { SubscriptionService } from '../service/SubscriptionService';
import { catchAsync } from '../middleware';
import { getIO } from '../socket';
import { deleteFile } from '../utils/fileHelper';
import { auditLog } from '../utils/logger';

export class EstablishmentController {

  private establishmentService: EstablishmentService;
  private subscriptionService?: SubscriptionService;

  constructor(establishmentService: EstablishmentService, subscriptionService?: SubscriptionService) {
    this.establishmentService = establishmentService;
    this.subscriptionService = subscriptionService;
  }

  listForAdmin = catchAsync(async (_req: Request, res: Response) => {
    const result = await this.establishmentService.listForAdmin();
    return res.status(200).json(result);
  });

  getDetailForAdmin = catchAsync(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const detail = await this.establishmentService.getDetailForAdmin(id);
    const paymentHistory = this.subscriptionService
      ? await this.subscriptionService.getEstablishmentHistory(id)
      : [];
    return res.status(200).json({ ...detail, paymentHistory });
  });

  checkCnpj = catchAsync(async (req: Request, res: Response) => {
    const result = await this.establishmentService.checkCnpjAvailable(req.body.cnpj);
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
    try {
      const establishment = await this.establishmentService.validateAccessCode(code);

      auditLog('get_by_code.success', {
        code,
        ip: req.ip,
        timestamp: new Date().toISOString(),
      });

      return res.status(200).json({
        id: establishment.id, 
        name: establishment.name,
        selfServiceCode: establishment.selfServiceCode,
        configurations: establishment.configurations
      });
    } catch (error) {
      auditLog('get_by_code.failure', {
        code,
        ip: req.ip,
        timestamp: new Date().toISOString(),
      });
      return res.status(404).json({ error: 'Estabelecimento não encontrado.' });
    }
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

    try {
      const updated = await this.establishmentService.updateEstablishment(establishmentId, updateData);
      
      getIO().emit('profile_updated');

      return res.status(200).json(updated);
    } catch (error) {
      auditLog('update_establishment.failure', {
        establishmentId,
        ip: req.ip,
        timestamp: new Date().toISOString(),
        updateData
      });
      return res.status(500).json({ error: 'Erro interno ao atualizar o estabelecimento.' });
    }
  });

  disable = catchAsync(async (req: Request, res: Response) => {
    const establishmentId = (req as any).usuario.estabelecimento;
    try {
      const result = await this.establishmentService.softDeleteEstablishment(establishmentId);
      auditLog('disable_establishment.success', {
        establishmentId,
        ip: req.ip,
        timestamp: new Date().toISOString(),
      });
      return res.status(200).json(result);
    } catch (error) {
      auditLog('disable_establishment.failure', {
        establishmentId,
        ip: req.ip,
        timestamp: new Date().toISOString(),
      });
      return res.status(500).json({ error: 'Erro interno ao desativar o estabelecimento.' });
    }
  });

}