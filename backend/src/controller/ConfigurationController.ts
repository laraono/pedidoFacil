import { Request, Response } from 'express';
import { ConfigurationService } from '../service/ConfigurationService';
import { getIO } from '../socket';
import path from 'path';
import { auditLog } from '../utils/logger';
import { 
    ensureBucketExists, 
    generateUniqueImageKey, 
    uploadToS3, 
    getImageContentType 
} from "../service/S3Service"; 

export class ConfigurationController {
  private configurationService: ConfigurationService;

  constructor(configurationService: ConfigurationService) {
    this.configurationService = configurationService;
  }

  async updateConfig(req: Request, res: Response) {
      const establishmentId = (req as any).usuario?.estabelecimento || 1;
      let configData = req.body;

    try {
      if (req.file) {
        const bucketName = process.env.AWS_BUCKET_NAME || 'pedidofacil-uploads';
        
        await ensureBucketExists(bucketName);

        const key = generateUniqueImageKey(req.file.buffer);
        const extension = path.extname(req.file.originalname) || '.jpg';
        const fullKey = `config-logo-${key}${extension}`;

        const contentType = getImageContentType(req.file);

        const uploadResult = await uploadToS3({
            bucket: bucketName,
            key: fullKey,
            body: req.file.buffer,
            contentType: contentType
        });

        configData.logo = uploadResult.Location;
      }

      const updatedConfig = await this.configurationService.updateConfiguration(
        establishmentId,
        configData,
      );

      getIO().emit('theme_updated');

      return res.status(200).json(updatedConfig);
    } catch (error) {
      auditLog('update_config.failure', {
        establishmentId,
        ip: req.ip,
        timestamp: new Date().toISOString(),
        configData
      });
      return res
        .status(500)
        .json({ message: 'Erro interno ao salvar configurações.' });
    }
  }

  async getConfig(req: Request, res: Response) {
    try {
      const establishmentId = Number(req.params.establishmentId);
      if (!establishmentId) {
        return res.status(400).json({ message: 'ID do estabelecimento inválido.' });
      }

      const config =
        await this.configurationService.getOrCreateConfiguration(
          establishmentId,
        );
      return res.status(200).json(config);
    } catch (error) {
      auditLog('config.fetch_error', { error: (error as Error).message, timestamp: new Date().toISOString() });
      return res
        .status(500)
        .json({ message: 'Erro ao buscar as configurações.' });
    }
  }
}