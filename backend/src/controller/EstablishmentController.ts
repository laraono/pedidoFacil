import { Request, Response } from 'express';
import { EstablishmentService } from '../service/EstablishmentService';
import { SubscriptionService } from '../service/SubscriptionService';
import { catchAsync } from '../middleware';
import { getIO } from '../socket';
import path from 'path';
import { auditLog } from '../utils/logger';
import { 
    ensureBucketExists, 
    generateUniqueImageKey, 
    uploadToS3, 
    getImageContentType 
} from "../service/S3Service"; 

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
    const serviceTypes: string[] = establishment.serviceTypes
      ? (typeof establishment.serviceTypes === 'string' ? JSON.parse(establishment.serviceTypes) : establishment.serviceTypes as unknown as string[])
      : [];
    return res.status(200).json({
      ...establishment,
      selfServiceEnabled: serviceTypes.includes('Autoatendimento'),
    });
  });
  
  getPublicProfile = catchAsync(async (req: Request, res: Response) => {
    const establishmentId = Number(req.params.id);
    const establishment = await this.establishmentService.getEstablishmentProfile(establishmentId);
    
    return res.status(200).json({
      name: establishment.name,
      paymentMethods: establishment.paymentMethods,
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
    } catch (error: any) {
      auditLog('get_by_code.failure', {
        code,
        ip: req.ip,
        timestamp: new Date().toISOString(),
      });
      const status = error?.statusCode ?? 404;
      const message = error?.message ?? 'Estabelecimento não encontrado.';
      return res.status(status).json({ error: message });
    }
  });

  update = catchAsync(async (req: Request, res: Response) => {
    const establishmentId = (req as any).usuario.estabelecimento;
    let updateData = { ...req.body };

    if (typeof updateData.paymentMethods === 'string') {
      updateData.paymentMethods = JSON.parse(updateData.paymentMethods);
    }
    
    if (typeof updateData.configurations === 'string') {
      updateData.configurations = JSON.parse(updateData.configurations);
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const bucketName = process.env.AWS_BUCKET_NAME || 'pedidofacil-uploads';
    let bucketChecked = false;

    const verifyBucket = async () => {
      if (!bucketChecked) {
        await ensureBucketExists(bucketName);
        bucketChecked = true;
      }
    };

    if (files?.logo?.[0]) {
      await verifyBucket();
      const logoFile = files.logo[0];
      
      const key = generateUniqueImageKey(logoFile.buffer);
      const extension = path.extname(logoFile.originalname) || '.jpg';
      const fullKey = `logo-${key}${extension}`;
      const contentType = getImageContentType(logoFile);

      const uploadResult = await uploadToS3({
        bucket: bucketName,
        key: fullKey,
        body: logoFile.buffer,
        contentType: contentType
      });

      updateData.configurations = {
        ...updateData.configurations,
        logo: uploadResult.Location
      };
    }

    if (files?.pixQrCode?.[0]) {
      await verifyBucket();
      const pixFile = files.pixQrCode[0];

      const key = generateUniqueImageKey(pixFile.buffer);
      const extension = path.extname(pixFile.originalname) || '.jpg';
      const fullKey = `pix-${key}${extension}`;
      const contentType = getImageContentType(pixFile);

      const uploadResult = await uploadToS3({
        bucket: bucketName,
        key: fullKey,
        body: pixFile.buffer,
        contentType: contentType
      });

      updateData.pixQrCodeUrl = uploadResult.Location;
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