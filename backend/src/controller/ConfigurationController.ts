import { Request, Response } from 'express';
import { ConfigurationService } from '../service/ConfigurationService';
import { getIO } from '../socket';
import { deleteFile } from '../utils/fileHelper';

export class ConfigurationController {
  private configurationService: ConfigurationService;

  constructor(configurationService: ConfigurationService) {
    this.configurationService = configurationService;
  }

  async updateConfig(req: Request, res: Response) {
    try {
      const establishmentId = (req as any).usuario?.estabelecimento || 1;
      let configData = req.body;

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
      console.error('Erro ao atualizar configurações:', error);
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
