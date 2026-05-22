import { Request, Response } from 'express';
import { ConfigurationService } from '../service/ConfigurationService';
import { getIO } from '../socket';
import { deleteFile } from '../utils/fileHelper';
import { auditLog } from '../utils/logger';

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
        const oldConfig =
          await this.configurationService.getOrCreateConfiguration(
            establishmentId,
          );

        if (oldConfig && oldConfig.logo) {
          deleteFile(oldConfig.logo);
        }

        configData.logo = req.file.filename;
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
      const establishmentId = Number(req.params.establishmentId) || 1;

      const config =
        await this.configurationService.getOrCreateConfiguration(
          establishmentId,
        );
      return res.status(200).json(config);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      return res
        .status(500)
        .json({ message: 'Erro ao buscar as configurações.' });
    }
  }
}
